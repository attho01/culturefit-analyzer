/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  CheckSquare, 
  ChevronRight, 
  Info,
  Type,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIProfile, TargetConditions } from '../types';

interface Step2Props {
  fileName: string;
  storyCount: number;
  profile: AIProfile;
  onComplete: (conditions: TargetConditions) => void;
}

const INDUSTRY_OPTIONS = [
  "IT·소프트웨어",
  "전자·전기·반도체",
  "자동차·모빌리티",
  "바이오·제약·의료",
  "물류·유통·커머스",
  "금융·은행·보험",
  "게임·메타버스",
  "콘텐츠·미디어·광고",
  "화학·에너지·소재",
  "패션·뷰티·라이프스타일",
  "건설·중장비·플랜트",
  "종합상사·무역",
  "식음료·F&B",
  "기계·설비·제조",
  "교육·에듀테크",
  "여행·호텔·관광",
  "공공·공기관·비영리",
  "컨설팅·전문서비스",
  "직접 입력"
];

const SIZE_OPTIONS = [
  "대기업",
  "중견기업",
  "외국계 기업",
  "스타트업·벤처",
  "공기업·공공기관",
  "상관없음"
];

export default function Step2({ fileName, storyCount, profile, onComplete }: Step2Props) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [targetCompany, setTargetCompany] = useState("");

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  const toggleSize = (size: string) => {
    if (size === "상관없음") {
      setSelectedSizes(["상관없음"]);
      return;
    }
    
    setSelectedSizes(prev => {
      const removedNone = prev.filter(s => s !== "상관없음");
      return removedNone.includes(size) 
        ? removedNone.filter(s => s !== size) 
        : [...removedNone, size];
    });
  };

  const isFormValid = ((selectedIndustries.length > 0 || customIndustry.trim() !== "") && selectedSizes.length > 0) || targetCompany.trim() !== "";

  return (
    <div className="space-y-12 pb-10">
      <header className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight leading-tight">어떤 기업을 <br className="sm:hidden" /> 찾고 계신가요?</h2>
        <p className="text-ink-muted dark:text-slate-400 text-base font-medium leading-relaxed">
          목표하는 업종과 기업 규모를 설정해주세요. <br className="hidden sm:block" />
          AI가 당신의 역량에 최적화된 맞춤형 매칭 분석을 시작합니다.
        </p>
      </header>

      {/* Section 1: Industries */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand/10 text-brand">
            <Briefcase className="w-5 h-5 font-bold" />
          </div>
          <h3 className="text-lg font-black tracking-tight">목표 업종 <span className="text-brand">(중복 가능)</span></h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {INDUSTRY_OPTIONS.map(industry => (
            <button
              key={industry}
              onClick={() => toggleIndustry(industry)}
              className={`px-5 py-2.5 rounded-2xl text-[13px] font-black transition-all duration-300 border shadow-sm ${
                selectedIndustries.includes(industry)
                  ? 'bg-brand text-white border-brand shadow-brand/20'
                  : 'bg-white dark:bg-slate-900 text-ink dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand/40 hover:text-brand'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {selectedIndustries.includes("직접 입력") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-2 animate-in slide-in-from-top-2 duration-300"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Type className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="세부 업종이나 키워드를 직접 입력하세요 (예: 핀테크, 2차전지 소재 등)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 px-12 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:border-brand/50 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 2: Sizes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-brand/10 text-brand">
            <Building2 className="w-5 h-5 font-bold" />
          </div>
          <h3 className="text-lg font-black tracking-tight">선호 기업 규모 <span className="text-brand">(중복 가능)</span></h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {SIZE_OPTIONS.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-5 py-2.5 rounded-2xl text-[13px] font-black transition-all duration-300 border shadow-sm ${
                selectedSizes.includes(size)
                  ? 'bg-brand text-white border-brand shadow-brand/20'
                  : 'bg-white dark:bg-slate-900 text-ink dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand/40 hover:text-brand'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* Section 3: Target Company */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand/10 text-brand">
            <Building2 className="w-5 h-5 font-bold outline-none" />
          </div>
          <h3 className="text-lg font-black tracking-tight">목표 기업 <span className="text-brand">(직접 입력)</span></h3>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Building2 className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
          </div>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="상세 분석을 원하는 기업명을 입력하세요 (예: 삼성전자, CJ대한통운)"
            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 px-12 py-5 rounded-3xl text-sm font-bold focus:outline-none focus:border-brand/50 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
          />
        </div>
      </section>

      {/* Section 4: Summary Dashboard */}
      <AnimatePresence>
        {(selectedIndustries.length > 0 || selectedSizes.length > 0 || targetCompany.trim() !== "") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-10"
          >
            <div className="card bg-brand-deep border-none p-10 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] bg-brand-light blur-[120px] rounded-full" />
              </div>

              <div className="relative space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <CheckSquare className="w-6 h-6 text-brand-light" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">최종 분석 캔버스 확인</h3>
                    <p className="text-brand-light font-bold text-xs uppercase tracking-widest mt-1">Ready for Intelligent Processing</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-blue-50">
                  <div className="space-y-4">
                    <span className="rail-label text-brand-light/50">Base Data</span>
                    <div className="space-y-1.5">
                      <p className="text-lg font-black text-white truncate max-w-[200px]">{fileName}</p>
                      <p className="text-sm font-bold text-slate-300">Total {storyCount} Experiences</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <span className="rail-label text-brand-light/50">Target Industry</span>
                     <div className="flex flex-wrap gap-1.5">
                        {selectedIndustries.filter(i => i !== "직접 입력").map(i => (
                           <span key={i} className="text-base font-black text-white">{i}</span>
                        ))}
                        {selectedIndustries.includes("직접 입력") && customIndustry && (
                           <span className="text-base font-black text-brand-light">{customIndustry}</span>
                        )}
                        {(selectedIndustries.length === 0 && !customIndustry) && <span className="text-slate-500">Not selected</span>}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <span className="rail-label text-brand-light/50">Target Size</span>
                     <p className="text-base font-black text-white truncate">
                        {selectedSizes.length > 0 ? selectedSizes.join(", ") : "Not selected"}
                     </p>
                  </div>

                  <div className="space-y-4">
                    <span className="rail-label text-brand-light/50">Target Company</span>
                    <p className="text-base font-black text-white truncate">
                      {targetCompany.trim() ? targetCompany : "Unspecified"}
                    </p>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col items-center gap-6">
                  <button
                    disabled={!isFormValid}
                    onClick={() => onComplete({
                      jobs: selectedIndustries,
                      customJob: customIndustry,
                      companySizes: selectedSizes,
                      targetCompany: targetCompany.trim() || undefined
                    })}
                    className={`group w-full md:w-auto px-16 py-6 font-black rounded-3xl text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
                      isFormValid 
                        ? 'bg-white text-brand-deep hover:bg-brand-light hover:scale-105 active:scale-95' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    분석 시작하기
                    <Zap className={`w-6 h-6 transition-transform group-hover:scale-125 ${isFormValid ? 'fill-brand-deep' : 'fill-white/30'}`} />
                  </button>
                  <div className="flex items-center gap-2 text-brand-light/60">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Real-time Data Fetching & Grounding Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
