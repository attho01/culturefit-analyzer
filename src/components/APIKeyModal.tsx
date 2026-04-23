/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Key, 
  ExternalLink, 
  ChevronRight, 
  Lock, 
  Eye, 
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface APIKeyModalProps {
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function APIKeyModal({ onSave, onClose }: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setIsVerifying(true);
    setError(null);
    try {
      // Verification call
      const verifyAi = new GoogleGenAI({ apiKey: apiKey.trim() });
      await (verifyAi as any).models.generateContent({ 
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: "hi" }] }] 
      });
      
      onSave(apiKey.trim());
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('invalid')) {
        setError("유효하지 않은 API Key입니다. 키를 다시 확인해주세요.");
      } else {
        setError(`API Key 승인 실패: ${err.message || '알 수 없는 오류'}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-deep/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-brand-deep/20 overflow-hidden"
      >
        <div className="p-8 sm:p-12 space-y-8">
          <div className="space-y-4 text-center">
            <h3 className="text-3xl font-black tracking-tight text-ink dark:text-white">
              Gemini API 키 입력
            </h3>
            <p className="text-base text-ink-muted dark:text-slate-400 font-bold leading-relaxed px-4">
              무료로 분석을 시작하려면 Gemini API 키가 필요합니다. <br />
              <span className="text-sm text-brand font-black">※ 입력하신 키는 서버에 저장되지 않으며 매 접속시 새로 입력해야 합니다.</span>
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="relative group">
                <input 
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-6 py-5 rounded-2xl bg-paper dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-slate-300"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-brand"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <button 
                onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-brand-deep dark:text-brand-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
              >
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
                Gemini API 키 발급받기 (Google AI Studio)
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/20"
              >
                {error}
              </motion.div>
            )}

            <button 
              onClick={handleSave}
              disabled={!apiKey.trim() || isVerifying}
              className="w-full py-5 bg-brand text-white rounded-2xl flex items-center justify-center gap-3 font-black shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                   키 유효성 검사 중...
                </div>
              ) : (
                <>
                  승인하고 분석 시작하기
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-ink-muted/50 uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            Session-only &middot; Not stored on server
          </div>
        </div>
      </motion.div>
    </div>
  );
}
