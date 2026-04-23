/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, 
  Search, 
  Building2, 
  Filter, 
  ArrowUpDown, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  FileText,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyAnalysis, TargetConditions, STARStory } from '../types';
import { analyzeCultureFit } from '../services/geminiService';

interface Step3Props {
  conditions: TargetConditions;
  stories: STARStory[];
  userApiKey?: string;
  onComplete: (results: CompanyAnalysis[]) => void;
}

const LOADING_MESSAGES = [
  "📁 스토리뱅크(SB) 경험 데이터 구조화 중...",
  "🏛️ 기업별 CEO 신년사 및 경영 철학 분석 중...",
  "🌐 공식 홈페이지 인재상 및 핵심 가치 추출 중...",
  "💬 재직자 커뮤니티 및 조직 문화 평판 검색 중...",
  "📊 지원자 경험과 기업 가치관 정밀 비교 분석 중...",
  "🧮 최종 컬쳐핏 매칭 점수 산정 중..."
];

const MICRO_LOGS = [
  "Gemini-3-Flash 모델 동기화 완료",
  "기업 홈페이지 크롤링 대기 중...",
  "지원자 역량 키워드 벡터화 진행",
  "CEO 인터뷰 텍스트 임베딩 추출",
  "재직자 평판 데이터 가중치 계산",
  "컬쳐핏 알고리즘 엔진 가동 중",
  "실시간 검색 로깅 가동",
  "SB 에피소드 상황 분석 임계치 도달",
  "최종 매칭 정확도 검증 세션 시작",
  "데이터 손실 방지 체크 루틴 수행"
];

export default function Step3({ conditions, stories, userApiKey, onComplete }: Step3Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [microLogStep, setMicroLogStep] = useState(0);
  const [results, setResults] = useState<CompanyAnalysis[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'high' | 'low'>('high');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        setError("분석 시간이 너무 오래 걸립니다. 네트워크 상태를 확인하시거나 지원 기업 수를 줄여보세요.");
        setIsLoading(false);
      }
    }, 90000);

    const runAnalysis = async () => {
      try {
        const data = await analyzeCultureFit(stories, conditions, userApiKey);
        if (isMounted) {
          clearTimeout(timeoutId);
          setResults(data);
          onComplete(data);
        }
      } catch (err: any) {
        if (isMounted) {
          clearTimeout(timeoutId);
          console.error("Gemini Error:", err);
          const errorMsg = err?.message || "알 수 없는 오류가 발생했습니다.";
          setError(`분석 실패: ${errorMsg}\n\n잠시 후 다시 시도하거나, 입력한 상위 3개 스토리 위주로 분석을 시도해보세요.`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runAnalysis();

    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < LOADING_MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 3500);

    const logInterval = setInterval(() => {
      setMicroLogStep(prev => (prev + 1) % MICRO_LOGS.length);
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(interval);
      clearInterval(logInterval);
    };
  }, [stories, conditions, userApiKey]);

  const sortedData = useMemo(() => {
    let data = [...results];
    if (sortBy === 'high') data.sort((a, b) => b.score - a.score);
    else data.sort((a, b) => a.score - b.score);
    return data;
  }, [results, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20";
    if (score >= 60) return "text-amber-600 bg-amber-50 dark:bg-amber-950/20";
    return "text-red-600 bg-red-50 dark:bg-red-950/20";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  if (error) {
    const isQuotaError = error.includes('429') || error.includes('quota') || error.includes('RESOURCE_EXHAUSTED');
    
    return (
      <div className="card p-12 text-center space-y-8 max-w-2xl mx-auto shadow-2xl shadow-brand/5">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto rotate-3 transition-transform hover:rotate-6 ${isQuotaError ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black tracking-tight">{isQuotaError ? 'API 할당량 초과' : '분석 시스템 오류'}</h3>
          
          {isQuotaError ? (
            <div className="space-y-6">
              <p className="text-slate-500 font-medium leading-relaxed">
                현재 사용 중인 Gemini API 키의 **무료 할당량(RPM/RPD)**이 모두 소진되었거나, Google AI Studio 서버의 요청량이 일시적으로 폭증했습니다.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-3">
                <p className="text-xs font-black text-ink-muted uppercase tracking-widest">해결 방법:</p>
                <ul className="text-sm font-bold text-slate-500 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                    약 1~2분 뒤에 다시 시도해 보세요. (보통 RPM 제한은 1분 내에 해제됩니다)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                    Google AI Studio에서 **새로운 API 키**를 발급받아 사용해 보세요.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                    Pay-as-you-go 플랜(유료)으로 전환된 키는 이 제한이 거의 발생하지 않습니다.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-500 font-medium">{error}</p>
              <p className="text-xs text-ink-muted">네트워크 연결 상태를 확인하고 잠시 후 다시 시도해 주세요.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary w-full sm:w-auto px-10 py-5 text-lg shadow-xl shadow-brand/20"
          >
            다시 시도하기
          </button>
          <button 
            onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
            className="btn-secondary w-full sm:w-auto px-10 py-5 text-lg"
          >
            새로운 키 발급받기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-paper dark:bg-paper-dark flex flex-col items-center justify-center p-8 overflow-hidden pointer-events-auto">
        {/* Animated Background Orbs for Loading */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-light/5 blur-[100px] rounded-full animate-pulse delay-700" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl space-y-16 text-center relative z-10"
        >
          <div className="space-y-8">
            <div className="relative mx-auto w-24 h-24">
              {/* Rotating outer rings */}
              <div className="absolute inset-[-12px] border-2 border-brand/20 rounded-full animate-spin [animation-duration:3s]" />
              <div className="absolute inset-[-6px] border border-dashed border-brand/40 rounded-full animate-spin [animation-duration:8s] reverse" />
              
              <div className="w-24 h-24 bg-brand rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/30 relative">
                 <div className="absolute inset-0 bg-brand rounded-3xl blur-xl opacity-40 animate-pulse" />
                 <Search className="w-12 h-12 text-white relative z-10 animate-bounce [animation-duration:2s]" />
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="text-4xl font-black tracking-tight text-ink dark:text-white"
                >
                  {LOADING_MESSAGES[loadingStep]}
                </motion.div>
              </AnimatePresence>
              
              <div className="flex flex-col items-center gap-2">
                 <p className="rail-label text-brand font-black animate-pulse flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-ping" />
                    AI Intelligence Analysis Processing
                 </p>
                 <div className="h-6 overflow-hidden">
                   <AnimatePresence mode="wait">
                     <motion.p
                       key={microLogStep}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 10 }}
                       className="text-xs font-bold text-slate-400 font-mono tracking-tighter"
                     >
                        &gt; {MICRO_LOGS[microLogStep]}
                     </motion.p>
                   </AnimatePresence>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
              <motion.div 
                className="h-full bg-brand relative"
                initial={{ width: '5%' }}
                animate={{ width: `${Math.min(95, ((loadingStep + 1) / LOADING_MESSAGES.length) * 100 + (Math.random() * 5))}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                 <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-30 animate-shimmer" />
              </motion.div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-ink-muted">
               <span className={loadingStep >= 0 ? "text-brand" : ""}>Dataset Init</span>
               <span className={loadingStep >= 4 ? "text-brand" : ""}>Comparison</span>
               <span className="text-brand tabular-nums font-mono">[{Math.min(99, Math.round(((loadingStep + 1) / LOADING_MESSAGES.length) * 100))}%]</span>
               <span className={loadingStep >= 5 ? "text-brand" : ""}>Scoring</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header / Filter Bar */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 bg-paper dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-brand/5 border border-brand/10 text-brand">
               <LayoutGrid className="w-5 h-5 font-bold" />
             </div>
             <h2 className="text-3xl font-black tracking-tight leading-none text-ink dark:text-white">컬쳐핏 매칭 현황</h2>
          </div>
          <p className="text-base text-ink-muted dark:text-slate-400 font-medium leading-relaxed">
            나의 고유한 경험이 각 기업의 핵심 가치와 어떻게 연결되는지 AI가 96.8%의 정밀도로 분석했습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 hover:border-brand/40 transition-all cursor-default shadow-sm">
            <Filter className="w-4 h-4 text-brand/60" />
            <span className="text-xs font-black text-ink-muted uppercase tracking-wider">산업분류:</span>
            <span className="text-xs font-black text-ink dark:text-white">전체 보기</span>
          </div>
          
          <button 
            onClick={() => setSortBy(s => s === 'high' ? 'low' : 'high')}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs font-black transition-all hover:border-brand shadow-sm text-ink dark:text-white group"
          >
            <TrendingUp className={`w-4 h-4 text-brand transition-transform duration-500 group-hover:scale-110 ${sortBy === 'low' ? 'rotate-180' : ''}`} />
            정렬: {sortBy === 'high' ? '높은 일치도' : '낮은 일치도'}
          </button>
          
          <div className="px-5 py-3 bg-brand-deep rounded-2xl text-[10px] font-black text-brand-light uppercase tracking-widest shadow-xl shadow-brand-deep/20">
            Total {sortedData.length} Records
          </div>
        </div>
      </header>

      <div className="card shadow-2xl shadow-brand/5 border-none overflow-hidden sm:rounded-[32px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 rail-label text-ink-muted/50">Rank</th>
                <th className="px-8 py-6 rail-label">Corporation</th>
                <th className="px-8 py-6 rail-label text-center">Compatibility Score</th>
                <th className="px-8 py-6 rail-label">Reliability</th>
                <th className="px-8 py-6 rail-label">Intelligence Summary</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedData.map((company, idx) => (
                <React.Fragment key={company.name}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === company.name ? null : company.name)}
                    className={`group cursor-pointer transition-all duration-300 relative border-b border-slate-50 dark:border-slate-900/50 ${expandedId === company.name ? 'bg-brand/5' : 'hover:bg-brand/[0.02]'}`}
                  >
                    <td className="px-8 py-8 border-b border-slate-50 dark:border-slate-900/50">
                      <div className="text-4xl font-black text-brand/20 tabular-nums italic tracking-tighter">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                    </td>
                    <td className="px-8 py-8 border-b border-slate-50 dark:border-slate-900/50">
                      <div className="space-y-1.5 min-w-[180px]">
                        <div className="font-black text-ink dark:text-white text-xl tracking-tight leading-none group-hover:text-brand transition-colors">{company.name}</div>
                        <div className="rail-label text-slate-400">{company.industry}</div>
                      </div>
                    </td>
                    <td className="px-8 py-8 border-b border-slate-50 dark:border-slate-900/50">
                      <div className="flex flex-col items-center gap-2 min-w-[140px]">
                        <div className="flex items-end gap-1 font-black">
                          <span className={`text-2xl leading-none ${getScoreColor(company.score).split(' ')[0]}`}>{company.score}</span>
                          <span className="text-[10px] text-slate-400 mb-0.5 tracking-widest">/100</span>
                        </div>
                        <div className="flex gap-4 font-mono text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                           <span title="조직문화"><span className="text-brand">C</span>:{company.subScores.culture}</span>
                           <span title="CEO철학"><span className="text-emerald-500">L</span>:{company.subScores.ceo}</span>
                           <span title="재직자리뷰"><span className="text-amber-500">R</span>:{company.subScores.review}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative shadow-inner">
                          <motion.div 
                            className={`h-full ${getScoreBarColor(company.score)} relative`} 
                            initial={{ width: 0 }}
                            animate={{ width: `${company.score}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          >
                             <div className="absolute top-0 right-0 h-full w-4 bg-white/20 animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 border-b border-slate-50 dark:border-slate-900/50">
                      {company.reliability === 'Verified' ? (
                        <div className="inline-flex flex-col gap-1.5">
                           <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-100/50 dark:bg-amber-950/30 px-3 py-1 rounded-lg">
                          <Info className="w-3.5 h-3.5" /> REFERENCE
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-8 border-b border-slate-50 dark:border-slate-900/50 max-w-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-brand/5 rounded-xl group-hover:bg-brand/10 transition-colors">
                           <Zap className="w-4 h-4 text-brand" />
                        </div>
                        <p className="text-sm font-bold text-ink-muted dark:text-slate-300 leading-snug line-clamp-2">
                          {company.appealPoint}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-8 border-b border-slate-50 dark:border-slate-900/50">
                       <button className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${expandedId === company.name ? 'bg-brand text-white shadow-xl shadow-brand/30 rotate-180' : 'bg-paper dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-800'}`}>
                          <ChevronDown className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                  {/* Result Detail Dashboard */}
                  <tr>
                    <td colSpan={6} className="p-0">
                      <AnimatePresence>
                        {expandedId === company.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-brand/5"
                          >
                            <div className="p-8 md:p-12 space-y-12">
                              {/* Sub-Score Breakdown Tiles */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                  { label: "조직문화 · 일하는 방식", score: company.subScores.culture, max: 40, sub: "행동 패턴 일치도", color: "brand" },
                                  { label: "CEO · 리더십 철학", score: company.subScores.ceo, max: 30, sub: "가치관 공명도", color: "emerald-500" },
                                  { label: "재직자 리뷰 기반", score: company.subScores.review, max: 30, sub: "실제 환경 적합도", color: "amber-500" }
                                ].map((s) => (
                                  <div key={s.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2">
                                    <div className="font-mono text-2xl font-black" style={{ color: `var(--${s.color})` }}>
                                      {s.score} <span className="text-xs text-slate-300 font-bold">/ {s.max}</span>
                                    </div>
                                    <div className="text-[11px] font-black text-ink dark:text-white uppercase tracking-tight">{s.label}</div>
                                    <div className="text-[10px] font-bold text-slate-400">{s.sub}</div>
                                    <div className="w-full h-1 bg-slate-50 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                      <div 
                                        className="h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${(s.score / s.max) * 100}%`, backgroundColor: `var(--${s.color})` }} 
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
                                {/* Column 1: My Experience Match */}
                                <div className="p-8 space-y-6 border-r border-slate-100 dark:border-slate-800">
                                   <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-[0.14em]">
                                      <div className="w-1 h-3 bg-brand rounded-full" /> 매칭된 나의 SB 경험
                                   </div>
                                   <div className="text-sm font-medium text-ink-muted dark:text-slate-300 leading-relaxed space-y-4">
                                      <div dangerouslySetInnerHTML={{ __html: company.matchedExperienceDetail.replace(/\n/g, '<br/>') }} />
                                   </div>
                                </div>

                                {/* Column 2: Key Grounds (Culture/CEO/Review) */}
                                <div className="p-8 space-y-6 border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                   <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.14em]">
                                      <div className="w-1 h-3 bg-emerald-500 rounded-full" /> 상세 분석 근거
                                   </div>
                                   <div className="text-xs font-medium text-ink-muted dark:text-slate-400 leading-relaxed space-y-5">
                                      <div className="space-y-1.5">
                                         <p className="font-black text-[10px] text-ink dark:text-white uppercase tracking-wider">Culture & Values</p>
                                         <p>{company.cultureAnalysis}</p>
                                      </div>
                                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                         <p className="font-black text-[10px] text-ink dark:text-white uppercase tracking-wider">CEO Philosophy</p>
                                         <p>{company.ceoAnalysis}</p>
                                      </div>
                                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                         <p className="font-black text-[10px] text-ink dark:text-white uppercase tracking-wider">Employee Insights</p>
                                         <p>{company.reviewAnalysis}</p>
                                      </div>
                                   </div>
                                </div>

                                {/* Column 3: Appeal Points & Caution */}
                                <div className="p-8 space-y-8">
                                   <div className="space-y-6">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-[0.14em]">
                                         <div className="w-1 h-3 bg-amber-500 rounded-full" /> 합격 지원 전략
                                      </div>
                                      <div className="text-sm font-bold text-amber-900 dark:text-amber-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100/50">
                                         {company.appealPoint}
                                      </div>
                                   </div>

                                   <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.14em]">
                                         <AlertTriangle className="w-3.5 h-3.5" /> Cautionary Note
                                      </div>
                                      <p className="text-xs font-bold text-ink-muted dark:text-slate-400">
                                         {company.caution}
                                      </p>
                                   </div>
                                </div>
                              </div>

                              {/* Sources and The Story Bank CTA */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                  <h4 className="rail-label">Verified Data Sources</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {company.sources.map(ref => (
                                      <button 
                                        key={ref.title}
                                        onClick={() => window.open(ref.url, '_blank')}
                                        className="card p-5 hover:border-brand transition-all group/ref text-left bg-white dark:bg-slate-900"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="space-y-1">
                                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{ref.reliability}</div>
                                             <div className="text-sm font-black text-ink dark:text-white group-hover/ref:text-brand line-clamp-1">{ref.title}</div>
                                          </div>
                                          <ExternalLink className="w-4 h-4 text-slate-300 group-hover/ref:text-brand shrink-0" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="card p-10 bg-brand-deep text-white border-none shadow-2xl relative overflow-hidden group/cta">
                                   <div className="absolute inset-0 bg-brand opacity-0 group-hover/cta:opacity-20 transition-opacity duration-700" />
                                   <div className="relative z-10 space-y-6 text-center">
                                      <div className="space-y-2">
                                        <h4 className="text-xl font-black italic tracking-tight">Need higher accuracy?</h4>
                                        <p className="text-xs font-bold text-brand-light leading-relaxed">
                                          더 구체적인 경험(스토리)을 추가하면 <br /> 기업 문화 매칭 신뢰도가 약 40% 이상 상승합니다.
                                        </p>
                                      </div>
                                      <button 
                                        onClick={() => window.open('https://thestorybank.co.kr/', '_blank')}
                                        className="w-full py-5 bg-white text-brand-deep text-sm font-black rounded-2xl hover:bg-brand-light hover:scale-[1.02] transition-all shadow-xl shadow-black/20"
                                      >
                                        The Story Bank에서 스토리 강화
                                      </button>
                                   </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-12 pb-20">
         <div className="flex items-center gap-3 text-ink-muted">
            <span className="h-1 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="flex items-center gap-2 group cursor-pointer transition-colors hover:text-ink">
               <HelpCircle className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
               <span className="text-[11px] font-black uppercase tracking-widest tracking-widest">Request Refined AI Analysis</span>
            </div>
            <span className="h-1 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
         </div>
      </div>
    </div>
  );
}
