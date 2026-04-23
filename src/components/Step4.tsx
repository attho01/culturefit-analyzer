/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Trophy, 
  Download, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Zap,
  Activity,
  Heart,
  Star,
  UserCircle,
  Share2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import JSZip from 'jszip';
import { AIProfile, STARStory, CompanyAnalysis } from '../types';

interface Step4Props {
  fileName: string;
  stories: STARStory[];
  profile: AIProfile;
  results: CompanyAnalysis[];
  onRestart: () => void;
}

export default function Step4({ fileName, stories, profile, results, onRestart }: Step4Props) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const top5 = results.slice(0, 5);
  
  const generateHTMLReport = () => {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>CultureFit 상세 매칭 리포트</title>
    <style>
        body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #1a1d26; max-width: 1000px; margin: 0 auto; padding: 40px; background: #f8f9fb; }
        .header { text-align: center; margin-bottom: 50px; padding: 40px; background: #fff; border-radius: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h1 { color: #3a6fd8; margin: 0; font-size: 32px; font-weight: 900; }
        .section { background: #fff; padding: 40px; border-radius: 24px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .section-title { font-size: 1.25rem; font-weight: 900; color: #3a6fd8; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #3a6fd8; display: inline-block; }
        .profile-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .profile-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
        .profile-table .label { font-weight: 900; width: 150px; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
        
        .company-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 40px; margin-bottom: 40px; position: relative; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .company-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .company-name { font-size: 28px; font-weight: 900; color: #1a1d26; }
        .score-badge { background: #3a6fd8; color: #fff; padding: 12px 24px; border-radius: 16px; font-weight: 900; font-size: 24px; box-shadow: 0 10px 15px -3px rgba(58,111,216,0.2); }
        
        .sub-scores { display: flex; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 20px; border: 1px solid #f1f5f9; }
        .sub-score-item { flex: 1; text-align: center; }
        .sub-score-val { font-weight: 900; color: #3a6fd8; font-size: 20px; }
        .sub-score-label { font-size: 11px; color: #94a3b8; font-weight: 700; margin-top: 4px; }
        
        .analysis-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; }
        .analysis-box { padding: 24px; border-right: 1px solid #f1f5f9; }
        .analysis-box:last-child { border-right: none; }
        .box-title { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .box-title::before { content: ''; width: 3px; height: 12px; background: #3a6fd8; border-radius: 2px; }
        .box-content { font-size: 13px; color: #475569; line-height: 1.7; }
        
        .appeal-box { background: #fffbeb; border: 1px solid #fef3c7; padding: 24px; border-radius: 20px; margin-top: 30px; }
        .appeal-title { color: #b45309; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        
        .caution-box { padding-top: 20px; border-top: 1px solid #f1f5f9; margin-top: 20px; }

        @media print { body { background: white; padding: 0; } .section, .company-card { box-shadow: none; border: 1px solid #f1f5f9; page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>CultureFit Analysis Report</h1>
        <p style="color: #64748b; margin-top: 10px; font-weight: 700;">${new Date().toLocaleDateString()} · AI-Driven Identity Matching</p>
    </div>

    <div class="section">
        <div class="section-title">지원자 심층 프로필</div>
        <table class="profile-table">
            <tr>
                <td class="label">핵심 역량</td>
                <td style="font-weight: 700;">${profile.keywords.join(' · ')}</td>
            </tr>
            <tr>
                <td class="label">핵심 가치</td>
                <td>${[...profile.valueSystem.core, ...profile.valueSystem.target, ...profile.valueSystem.instrumental].join(', ')}</td>
            </tr>
        </table>
    </div>

    <div class="section" style="background: transparent; box-shadow: none; padding: 0;">
        <div class="section-title">TOP 5 기업 매칭 비교 분석</div>
        
        ${results.map(c => `
            <div class="company-card">
                <div class="company-header">
                    <div>
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">RANK ${c.rank.toString().padStart(2, '0')} · ${c.industry}</div>
                        <div class="company-name">${c.name}</div>
                    </div>
                    <div class="score-badge">${c.score}</div>
                </div>

                <div class="sub-scores">
                    <div class="sub-score-item">
                        <div class="sub-score-val">${c.subScores.culture}</div>
                        <div class="sub-score-label">조직문화 (40)</div>
                    </div>
                    <div class="sub-score-item">
                        <div class="sub-score-val">${c.subScores.ceo}</div>
                        <div class="sub-score-label">CEO 철학 (30)</div>
                    </div>
                    <div class="sub-score-item">
                        <div class="sub-score-val">${c.subScores.review}</div>
                        <div class="sub-score-label">현직자 평판 (30)</div>
                    </div>
                </div>

                <div class="analysis-grid">
                    <div class="analysis-box">
                        <div class="box-title">Matched My Experience</div>
                        <div class="box-content" style="font-weight: 700;">${c.matchedExperienceDetail}</div>
                    </div>
                    <div class="analysis-box" style="background: #f8fafc;">
                        <div class="box-title">Verification Grounds</div>
                        <div class="box-content" style="font-size: 11px;">
                            <strong style="color: #3a6fd8;">Culture:</strong> ${c.cultureAnalysis}<br/><br/>
                            <strong style="color: #059669;">CEO:</strong> ${c.ceoAnalysis}<br/><br/>
                            <strong style="color: #d97706;">Review:</strong> ${c.reviewAnalysis}
                        </div>
                    </div>
                    <div class="analysis-box">
                        <div class="box-title">Reliability Summary</div>
                        <div class="box-content">${c.evidenceSummary}</div>
                    </div>
                </div>

                <div class="appeal-box">
                    <div class="appeal-title">Strategic Appeal Point</div>
                    <div class="box-content" style="color: #92400e; font-weight: 900; font-size: 15px;">${c.appealPoint}</div>
                </div>

                <div class="caution-box">
                    <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">Cautionary Note</div>
                    <div style="font-size: 12px; color: #e11d48; font-weight: 700; margin-top: 4px;">${c.caution}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div style="text-align: center; font-size: 10px; color: #94a3b8; font-weight: 900; margin-top: 60px; text-transform: uppercase; letter-spacing: 2px;">
        &copy; 2026 ACLPro. All rights reserved
    </div>
</body>
</html>
    `;
  };

  const handleDownloadZIP = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      // 1. HTML Report
      const htmlContent = generateHTMLReport();
      zip.file(`CultureFit_Report_${fileName.split('.')[0]}.html`, htmlContent);
      
      // 2. CSV Summary
      const csvContent = [
        "Rank,Company,Industry,Size,ScoreLabel,AppealPoint,Evidence",
        ...results.map(r => `${r.rank},"${r.name}","${r.industry}","${r.size}",${r.score},"${r.appealPoint.replace(/"/g, '""')}","${r.evidenceSummary.replace(/"/g, '""')}"`)
      ].join('\n');
      zip.file("Results_Summary.csv", "\ufeff" + csvContent); // BOM for Excel UTF-8

      // 3. User Profile Info
      const profileInfo = [
        `Analysis Report: ${fileName}`,
        `Keywords: ${profile.keywords.join(', ')}`,
        `Core Values: ${profile.valueSystem.core.join(', ')}`,
        `Target Values: ${profile.valueSystem.target.join(', ')}`,
        `Instrumental Values: ${profile.valueSystem.instrumental.join(', ')}`
      ].join('\n');
      zip.file("My_Profile.txt", profileInfo);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CultureFit_Export_${fileName.split('.')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const markdown = [
      `# CultureFit 분석 결과 리포트`,
      `분석 일시: ${new Date().toLocaleString()}`,
      `파일명: ${fileName} (${stories.length}개 스토리)`,
      `핵심 역량: ${profile.keywords.join(', ')}`,
      '',
      `## TOP ${results.length} 기업 매칭 결과`,
      `| 순위 | 기업명 | 산업군 | 점수 | 신뢰도 | 어필 포인트 |`,
      `|---|---|---|---|---|---|`,
      ...results.map(r => `| ${r.rank} | ${r.name} | ${r.industry} | ${r.score}점 | ${r.sources.every(s => s.reliability === 'verified') ? '검증됨' : '참고필요'} | ${r.appealPoint} |`),
      '',
      `---`,
      `Generated by CultureFit Analyzer`
    ].join('\n');

    navigator.clipboard.writeText(markdown).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe'];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <span className="text-2xl">🥇</span>;
      case 2: return <span className="text-2xl">🥈</span>;
      case 3: return <span className="text-2xl">🥉</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Profil Summary Dashboard */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-brand/5 border border-brand/10 text-brand">
               <UserCircle className="w-5 h-5 font-bold" />
             </div>
             <h2 className="text-2xl font-black tracking-tight text-ink dark:text-white">나의 분석 프로필</h2>
          </div>
          <span className="rail-label text-brand tabular-nums">Analysis ID: #CF-{Math.floor(Math.random()*10000)}</span>
        </div>
        
        <div className="card p-10 bg-white dark:bg-slate-900 border-none shadow-2xl shadow-brand/5 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 sm:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="rail-label text-slate-400">Captured Source</span>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-black text-ink dark:text-white truncate max-w-[180px]">{fileName || "Manual Entry"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <span className="rail-label text-slate-400">Core Keywords</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.keywords.map(k => (
                    <span key={k} className="px-3 py-1 rounded-lg bg-brand/5 text-brand text-[11px] font-black uppercase tracking-wider">#{k}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:pl-12 col-span-1 md:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: "Value System", value: `${profile.valueSystem.core.join(', ')} (Core) / ${profile.valueSystem.target.join(', ')} (Target)`, icon: <Heart className="w-4 h-4" /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-2.5 sm:col-span-2">
                    <div className="flex items-center gap-2">
                       <div className="text-brand/40">{item.icon}</div>
                       <span className="rail-label text-slate-400">{item.label}</span>
                    </div>
                    <p className="text-base font-bold text-ink-muted dark:text-slate-300 leading-relaxed leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP 5 High-End Cards */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
            <Trophy className="w-5 h-5 font-bold" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-ink dark:text-white">Professional Match TOP 5</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {top5.map((company, index) => {
             const chartData = [
              { name: '조직문화', value: company.subScores.culture },
              { name: 'CEO철학', value: company.subScores.ceo },
              { name: '재직자리뷰', value: company.subScores.review },
            ];
            return (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, type: "spring", damping: 20 }}
                className="card p-0 overflow-hidden group hover:shadow-3xl hover:shadow-brand/10 transition-all border-none bg-white dark:bg-slate-900 shadow-xl shadow-brand/5 flex flex-col"
              >
                {/* Rank Header */}
                <div className={`h-1.5 w-full ${index === 0 ? 'bg-brand' : index === 1 ? 'bg-brand-light' : 'bg-slate-300'}`} />
                
                <div className="p-10 flex-1 flex flex-col space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm italic ${index === 0 ? 'bg-amber-100/50 text-amber-600' : index === 1 ? 'bg-slate-100 text-slate-500' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-brand/5 text-brand'}`}>
                           {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                         </span>
                         <span className="rail-label text-slate-400">{company.industry}</span>
                       </div>
                       <h3 className="text-2xl font-black tracking-tight text-ink dark:text-white group-hover:text-brand transition-colors">{company.name}</h3>
                    </div>
                    <div className="text-right">
                       <div className={`text-4xl font-black tabular-nums leading-none ${company.score >= 80 ? 'text-brand' : 'text-amber-500'}`}>{company.score}</div>
                       <div className="rail-label mt-1 text-slate-400">Fit %</div>
                    </div>
                  </div>

                  {/* Chart Visualization */}
                  <div className="relative flex justify-center py-4 bg-paper/30 dark:bg-slate-950/30 rounded-3xl group-hover:bg-brand/5 transition-colors">
                    <div className="w-[160px] h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            animationBegin={300}
                          >
                            {COLORS.map((color, i) => (
                              <Cell key={i} fill={color} className="hover:opacity-80 transition-opacity" />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Focus</span>
                        <span className="text-base font-black text-ink dark:text-white">Analysis</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {company.matchedStories.slice(0, 3).map(skill => (
                        <span key={skill} className="px-3 py-1.5 rounded-full bg-paper dark:bg-slate-800 text-[10px] font-black text-ink-muted dark:text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800 group-hover:border-brand/20 transition-colors">#{skill}</span>
                      ))}
                    </div>
                    <div className="relative">
                       <span className="absolute -top-4 -left-2 text-4xl text-brand/10 font-serif">“</span>
                       <p className="text-[15px] font-bold text-ink dark:text-slate-200 leading-relaxed text-center px-4 relative z-10">
                          {company.appealPoint}
                       </p>
                       <span className="absolute -bottom-6 -right-2 text-4xl text-brand/10 font-serif">”</span>
                    </div>
                  </div>
                </div>

                <div className="px-10 py-5 bg-paper dark:bg-slate-950 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                  <span className="rail-label text-slate-400">View Detail Report</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1.5 group-hover:text-brand transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Master Export Control Panel */}
      <section className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={handleDownloadZIP}
            disabled={isExporting}
            className="btn-primary w-full md:w-auto px-16 py-6 text-xl shadow-3xl shadow-brand/20 group relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-4">
               {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />}
               <span>전체 분석 ZIP 내보내기</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
          </button>

          <div className="relative w-full md:w-auto">
            <button 
              onClick={handleCopy}
              className="btn-secondary w-full md:w-auto px-16 py-6 text-xl group"
            >
              <div className="flex items-center justify-center gap-4">
                 <Copy className="w-6 h-6 text-slate-400 group-hover:text-brand transition-colors" />
                 <span>텍스트 결과 복사</span>
              </div>
            </button>
            <AnimatePresence>
              {copySuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 px-6 py-3 bg-brand-deep text-white text-xs font-black rounded-2xl shadow-2xl flex items-center gap-3 whitespace-nowrap z-20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-brand/20 animate-pulse" />
                  <ClipboardCheck className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 uppercase tracking-widest leading-none pt-0.5">Success! Clipboard Updated</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global CTA Integration */}
        <div className="bg-brand-deep p-12 md:p-16 rounded-[40px] text-white flex flex-col xl:flex-row items-center gap-12 relative overflow-hidden shadow-2xl shadow-brand/10">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-light/10 blur-[100px] rounded-full" />
          
          <div className="flex-1 space-y-4 text-center xl:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 rail-label text-white !tracking-[0.2em]">Next Evolution</div>
            <h4 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              매칭 점수가 아쉬우신가요? <br className="hidden md:block" />
              나의 스토리를 더 정교하게 다듬어보세요.
            </h4>
            <p className="text-lg text-brand-light/80 font-bold leading-relaxed max-w-2xl">
              The Story Bank에서 AI 스토리라이터를 통해 당신의 경험을 완벽한 STAR 기법으로 재조립할 수 있습니다. <br className="hidden lg:block" />
              업데이터된 파일로 재분석하면 매칭 정확도가 약 42% 이상 정밀해집니다.
            </p>
          </div>
          <button 
            onClick={() => window.open('https://thestorybank.co.kr/', '_blank')}
            className="whitespace-nowrap px-12 py-7 bg-white text-brand-deep text-xl font-black rounded-3xl flex items-center justify-center gap-4 hover:bg-brand-light hover:scale-105 transition-all shadow-2xl shadow-black/20 relative z-10 group"
          >
            스토리 강화하러 가기
            <ExternalLink className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        <button 
          onClick={onRestart}
          className="mx-auto flex items-center gap-3 px-8 py-3 rounded-full hover:bg-brand/5 text-[11px] font-black text-ink-muted/50 hover:text-brand transition-all uppercase tracking-[0.3em]"
        >
          <RefreshCw className="w-4 h-4" />
          Restart Analysis Flow
        </button>
      </section>
    </div>
  );
}
