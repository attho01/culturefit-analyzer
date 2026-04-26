/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Target, 
  LayoutGrid, 
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import LandingPage from './components/LandingPage';
import APIKeyModal from './components/APIKeyModal';
import { STARStory, AIProfile, TargetConditions, CompanyAnalysis } from './types';

// Shared Dummy Data for visibility if not computed
const DUMMY_RESULTS: CompanyAnalysis[] = [
  {
    rank: 1,
    name: "쿠팡",
    industry: "이커머스·물류",
    size: "대기업",
    score: 88,
    reliability: 'Verified',
    subScores: { culture: 36, ceo: 26, review: 26 },
    matchedStories: ["데이터 분석", "문제해결", "SCM"],
    matchedExperienceDetail: "지원자의 [이커머스 물류 최적화 프로젝트] 성과는 쿠팡이 추구하는 전사적 효율화 및 데이터 기반 의사결정 방식과 완벽히 부합합니다.",
    cultureAnalysis: "쿠팡의 'WOW' 문화와 지원자의 도전적 태도가 일치합니다.",
    ceoAnalysis: "김범석 의장의 고객 중심 경영 철학은 지원자의 SB 가치관과 공명합니다.",
    reviewAnalysis: "현직자 리뷰에 따르면 주도적 업무 수행을 선호하며 지원자의 행동 패턴과 일치합니다.",
    evidenceSummary: "지원자의 데이터 기반 문제해결 경험이 쿠팡의 'Wow the Customer'라는 핵심 가치와 완벽하게 일치합니다.",
    sources: [{ title: "쿠팡 기업 문화 가이드", url: "https://www.coupang.jobs/kr/culture/", reliability: "verified" }],
    appealPoint: "혁신 지향적 문화와 로켓 성장을 지향하는 리더십",
    caution: "속도가 매우 빠른 조직이므로 업무 강도가 높게 느껴질 수 있습니다."
  }
];

export default function App() {
  const [step, setStep] = useState(0); // 0 is Landing
  const [darkMode, setDarkMode] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // App State
  const [fileName, setFileName] = useState("");
  const [stories, setStories] = useState<STARStory[]>([]);
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [conditions, setConditions] = useState<TargetConditions | null>(null);
  const [analysisResults, setAnalysisResults] = useState<CompanyAnalysis[]>([]);

  // darkMode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const steps = [
    { id: 1, title: '분석 준비', icon: <FileText className="w-5 h-5" /> },
    { id: 2, title: '목표 설정', icon: <Target className="w-5 h-5" /> },
    { id: 3, title: 'AI 분석', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 4, title: '최종 리포트', icon: <Download className="w-5 h-5" /> },
  ];

  const handleStep1Complete = (extractedStories: STARStory[], extractedProfile: AIProfile, file?: File) => {
    setStories(extractedStories);
    setProfile(extractedProfile);
    if (file) setFileName(file.name);
    setStep(2);
  };

  const handleStep2Complete = (targetConditions: TargetConditions) => {
    setConditions(targetConditions);
    setStep(3);
  };

  const handleStep3Complete = (results: CompanyAnalysis[]) => {
    setAnalysisResults(results);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));
  const restart = () => {
    setStep(0);
    setStories([]);
    setProfile(null);
    setConditions(null);
    setFileName("");
    setAnalysisResults([]);
  };

  const handleStart = () => {
    // Always show API Key modal if not already set in this session's state
    if (!userApiKey) {
      setShowApiKeyModal(true);
    } else {
      setStep(1);
    }
  };

  const handleApiKeySave = (key: string) => {
    // Only save to local state for this session, per user request
    setUserApiKey(key);
    setShowApiKeyModal(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-paper-dark">
      <AnimatePresence>
        {showApiKeyModal && (
          <APIKeyModal 
            onSave={handleApiKeySave} 
            onClose={() => setShowApiKeyModal(false)} 
          />
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={restart}
          >
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-xl shadow-brand/20 group-hover:rotate-6 transition-all duration-500">
              <span className="font-black text-xl">C</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-ink dark:text-white leading-none tracking-tight">
                CultureFit Analyzer
              </h1>
              <span className="text-[10px] font-black text-ink-muted/60 dark:text-slate-500 tracking-tighter uppercase whitespace-nowrap">AI-Driven Matching</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {step > 0 && step < 4 && (
              <button 
                onClick={prevStep}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-brand transition-colors uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-brand/5"
              >
                <ChevronLeft className="w-4 h-4" />
                뒤로가기
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl bg-paper dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-ink-muted dark:text-slate-400 hover:text-brand hover:border-brand/40 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {step === 0 ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <main className={`flex-1 mx-auto w-full px-6 py-12 pb-32 transition-all duration-500 ${step >= 3 ? 'max-w-7xl' : 'max-w-4xl'}`}>
          {/* Progress Indicator */}
          <div className="mb-20 hidden md:block">
            <div className="flex items-center gap-6">
              {steps.map((s) => (
                <div key={s.id} className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`step-indicator ${step === s.id ? 'active' : step > s.id ? 'complete' : ''}`}>
                      {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-[0.15em] ${step >= s.id ? 'text-ink dark:text-white' : 'text-ink-muted'}`}>
                      {s.title}
                    </span>
                  </div>
                  <div className={`h-1 rounded-full transition-all duration-1000 ${step >= s.id ? 'bg-brand w-full' : 'bg-slate-200 dark:bg-slate-800 w-full'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={step < 3 ? "card p-8 md:p-12 shadow-2xl shadow-brand/5" : ""}
              >
                {step === 1 && (
                  <Step1 
                    userApiKey={userApiKey}
                    onComplete={handleStep1Complete} 
                    onApiKeySave={(key) => setUserApiKey(key)} 
                  />
                )}
                
                {step === 2 && profile && (
                  <Step2 
                    fileName={fileName}
                    storyCount={stories.length}
                    profile={profile}
                    onComplete={handleStep2Complete}
                  />
                )}

                {step === 3 && conditions && (
                  <div className="space-y-8">
                    <Step3 
                      conditions={conditions}
                      stories={stories}
                      userApiKey={userApiKey || undefined}
                      onComplete={handleStep3Complete}
                      onRequestApiKeyChange={() => setShowApiKeyModal(true)}
                    />
                    {analysisResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end pt-8"
                      >
                        <button 
                          onClick={() => setStep(4)}
                          className="btn-primary flex items-center justify-center gap-3 group px-12 py-5 text-lg"
                        >
                          최종 결과 리포트 발행
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 4 && profile && (
                  <Step4 
                    fileName={fileName}
                    stories={stories}
                    profile={profile}
                    results={analysisResults}
                    onRestart={restart}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      )}

      {/* Mobile Nav */}
      {step > 0 && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-8 py-5">
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
                disabled={s.id > step}
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  step === s.id ? 'text-brand scale-110' : 'text-ink-muted'
                } ${s.id > step ? 'opacity-20' : 'opacity-100'}`}
              >
                <div className={`p-2 rounded-2xl ${step === s.id ? 'bg-brand text-white shadow-lg shadow-brand/20' : ''}`}>
                  {s.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{s.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Footer */}
      {step > 0 && (
        <footer className="py-10 text-center border-t border-slate-100 dark:border-slate-800 bg-paper dark:bg-paper-dark">
          <div className="max-w-7xl mx-auto px-6 space-y-2">
             <div className="rail-label">&copy; 2026 ACLPro. All rights reserved</div>
             <p className="text-[10px] text-ink-muted dark:text-slate-600 font-medium">Powered by Google Gemini 1.5 & Google Search Grounding</p>
          </div>
        </footer>
      )}
    </div>
  );
}

