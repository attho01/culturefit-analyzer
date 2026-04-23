import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Globe2, 
  Flame,
  Binary,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const features = [
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: "Real-time Search Grounding",
      description: "AI가 구글 검색을 통해 기업의 최신 뉴스, 재직자 리뷰, CEO 철학을 실시간으로 분석합니다."
    },
    {
      icon: <Binary className="w-6 h-6" />,
      title: "STAR Model Parsing",
      description: "당신의 복잡한 경험 데이터를 AI가 STAR 기법으로 자동 파싱하여 핵심 역량을 추출합니다."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Matching",
      description: "조직문화 점수(40), CEO 철학(30), 재직자 리뷰(30)를 수치화하여 최적의 핏을 찾아냅니다."
    }
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-paper-dark">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-light/5 blur-[120px] rounded-full translate-x-1/4 translate-y-1/4" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/5 border border-brand/10 text-brand text-xs font-bold uppercase tracking-widest"
          >
            <Flame className="w-3.5 h-3.5 fill-brand" />
            AI-Driven Culture Matching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]"
          >
            나의 스토리를 <br />
            <span className="gradient-text">최고의 기업</span>과 연결하다
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-ink-muted dark:text-slate-400 font-medium leading-relaxed"
          >
            단순한 채용 공고 매칭이 아닙니다. AI가 실시간 데이터를 기반으로 <br className="hidden md:block" />
            당신의 성향과 기업의 조직문화 적합도(Culture Fit)를 98% 확률로 분석합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-6 pt-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <button
                onClick={onStart}
                className="btn-primary px-10 py-5 text-lg group flex items-center gap-3 w-full sm:w-auto"
              >
                지금 무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.open('https://thestorybank.co.kr/', '_blank')}
                className="btn-secondary px-10 py-5 text-lg flex items-center gap-3 w-full sm:w-auto"
              >
                내 스토리 보기
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-green-600 dark:text-green-400 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Gemini API 키만 있으면 완전 무료
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">왜 CultureFit Analyzer인가요?</h2>
            <p className="text-ink-muted dark:text-slate-400 font-medium">단순한 검색으로는 알 수 없는 심층적인 리포트를 제공합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-8 card-hover space-y-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-ink-muted dark:text-slate-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="relative py-24 px-6 bg-paper dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "분석된 스토리", value: "1.2M+" },
              { label: "실시간 정보원", value: "8,500+" },
              { label: "평균 매칭 신뢰도", value: "96.4%" },
              { label: "분석 성공 기업", value: "12,000+" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black gradient-text">{stat.value}</div>
                <div className="rail-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto card p-12 md:p-20 text-center bg-brand-deep border-none shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          
          <div className="relative space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              가장 나다운 곳으로의 <br className="hidden md:block" />
              첫 걸음을 지금 시작하세요.
            </h2>
            <p className="text-brand-light font-bold text-lg">
              3분이면 충분합니다. AI가 당신의 커리어를 재해석합니다.
            </p>
            <div className="pt-4">
              <button
                onClick={onStart}
                className="bg-white text-brand-deep px-12 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
              >
                무료 분석 시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-brand rounded-lg rotate-12 flex items-center justify-center text-white text-[10px] font-bold">CA</div>
            <span className="font-black tracking-tighter">CultureFit Analyzer</span>
          </div>
          <p className="text-xs text-ink-muted dark:text-slate-500 font-medium">
            &copy; 2026 ACLPro. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
