/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { 
  Paperclip, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  Edit2, 
  ExternalLink,
  Loader2,
  ChevronRight,
  Target,
  Trophy,
  Hammer,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { STARStory, AIProfile } from '../types';

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Step1Props {
  userApiKey: string | null;
  onComplete: (stories: STARStory[], profile: AIProfile, file: File) => void;
  onApiKeySave: (key: string) => void;
}

export default function Step1({ userApiKey, onComplete }: Step1Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [stories, setStories] = useState<STARStory[]>([]);
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.match(/\.(pdf|xlsx|xls)$/i)) {
      setError("PDF 또는 Excel 파일만 업로드 가능합니다");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("파일 용량은 10MB를 초과할 수 없습니다");
      return;
    }

    setFile(selectedFile);
    await parseFile(selectedFile);
  };

  const extractStoriesWithAI = async (text: string, apiKey: string): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey });
    let retryCount = 0;
    const maxRetries = 2;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const prompt = `
당신은 취업 컨설턴트 보조 AI입니다. 다음 텍스트에서 취업용 '경험 스토리'들을 분석하여 '가치 체계'를 추출하고 JSON 데이터로 변환하십시오.

[가치 체계 정의]
1. 핵심가치(Core Values): 지원자가 인생과 일에서 가장 중요하게 생각하는 근본적인 원칙 (예: 정직, 도전, 성실)
2. 목표가치(Target Values): 지원자가 업무나 프로젝트를 통해 궁극적으로 달성하고자 하는 목표 (예: 고객 만족, 혁신적 성과, 사회적 공헌)
3. 수단가치(Instrumental Values): 목표를 달성하기 위해 지원자가 주로 사용하는 방법이나 태도 (예: 데이터 분석, 협업, 빠른 실행력)

[출력 형식]
{
  "stories": [
    {
      "competency": "역량 제목",
      "situation": "상황 설명",
      "task": "당시 목표나 어려움",
      "action": "구체적인 행동",
      "result": "결과 및 수치 성과",
      "keywords": ["키워드1", "키워드2"]
    }
  ],
  "valueSystem": {
    "core": ["핵심가치1", "핵심가치2"],
    "target": ["목표가치1", "목표가치2"],
    "instrumental": ["수단가치1", "수단가치2"]
  },
  "patterns": "지원자의 전반적인 행동 패턴 분석 요약",
  "resultStyle": "지원자의 성과 서술 스타일 요약"
}

[데이터]
${text.substring(0, 10000)}
`;

    while (retryCount <= maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });
        
        const jsonText = response.text;
        if (!jsonText) return null;
        
        return JSON.parse(jsonText);
      } catch (err: any) {
        const errorMsg = err?.message || "";
        if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("high demand")) {
          retryCount++;
          if (retryCount <= maxRetries) {
            await delay(1500 * retryCount); // Exponential-ish backoff
            continue;
          }
        }
        console.error("AI Extraction failed:", err);
        throw err; // Re-throw to be caught by parseFile
      }
    }
    return null;
  };

  const parsePDF = async (file: File): Promise<{ text: string, stories: STARStory[] }> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n";
    }

    const segments = fullText.split(/역량명|Competency|\[핵심역량\]|제목|Title|경험\d+|스토리\d+|항목\d+|경험명|경험제목/i)
      .filter(s => s.trim().length > 30);
    
    const stories: any[] = [];

    segments.forEach((segment) => {
        const sMatch = segment.match(/(상황|Situation|맥락|Context|문제|Problem|배경|Background)[:\s]+([\s\S]*?)(?=(과업|Task|분석|Analysis|장애|Obstacle|어려움|목표|Goal|행동|Action|결과|Result|성과|$))/i);
        const tMatch = segment.match(/(과업|Task|분석|Analysis|장애|Obstacle|어려움|목표|Goal)[:\s]+([\s\S]*?)(?=(행동|Action|노력|대응|결과|Result|성과|$))/i);
        const aMatch = segment.match(/(행동|Action|노력|대응|Response|수행)[:\s]+([\s\S]*?)(?=(결과|Result|성과|배운점|성취|$))/i);
        const rMatch = segment.match(/(결과|Result|성과|Outcome|성취|Achievement)[:\s]+([\s\S]*?)(?=(역량명|Competency|\[|경험|스토리|항목|$))/i);

        if (aMatch && rMatch) {
            const lines = segment.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const competencyLine = lines[0].replace(/^[:\s-]+/, '').substring(0, 50);
            
            stories.push({
                competency: competencyLine || "경험 분석",
                situation: (sMatch?.[2] || tMatch?.[2] || "").trim().substring(0, 500),
                task: (tMatch?.[2] || "").trim().substring(0, 500),
                action: aMatch[2].trim().substring(0, 1000),
                result: rMatch[2].trim().substring(0, 600),
                keywords: competencyLine.split(/[,\s]+/).filter(k => k.length >= 2).slice(0, 3)
            });
        }
    });

    const filtered = stories
        .filter((s) => 
            s.competency && 
            !s.competency.toUpperCase().includes('AGE') && 
            !s.competency.toUpperCase().includes('나이') &&
            (s.situation.length > 5 || s.action.length > 5)
        )
        .map((s, idx) => ({ ...s, no: idx + 1, keywords: s.keywords.length > 0 ? s.keywords : ["역량강점"] }));

    return { text: fullText, stories: filtered };
  };

  const parseExcel = async (file: File): Promise<STARStory[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet) as any[];

    return json
      .map((row) => {
        const competency = row.Competency || row['역량명'] || row.Title || row['제목'] || "미지정";
        const keywords = (row.Keywords || row['키워드'] || "").split(/[,\s]+/).filter((k: string) => k.length > 0);

        const situation = row.Situation || row['상황'] || row.Context || row['맥락'] || row.Problem || row['문제'] || "";
        const task = row.Task || row['과업'] || row.Analysis || row['분석'] || row.Obstacle || row['장애'] || "";
        const action = row.Action || row['행동'] || row.Effort || row['노력'] || "";
        const result = row.Result || row['결과'] || row.Outcome || row['성과'] || "";

        return {
          competency,
          situation: String(situation),
          task: String(task),
          action: String(action),
          result: String(result),
          keywords: keywords.length > 0 ? keywords : [competency.substring(0, 4)]
        };
      })
      .filter((s) => 
        s.competency && 
        !s.competency.toUpperCase().includes('AGE') && 
        !s.competency.toUpperCase().includes('나이') &&
        (s.situation.length > 2 || s.action.length > 2)
      )
      .map((s, idx) => ({ ...s, no: idx + 1 }));
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    try {
      let extractedStories: STARStory[] = [];
      let rawText = "";
      
      if (file.name.endsWith('.pdf')) {
        const { text, stories } = await parsePDF(file);
        extractedStories = stories;
        rawText = text;
      } else {
        extractedStories = await parseExcel(file);
      }

      let aiResult: any = null;
      if (userApiKey) {
        try {
          aiResult = await extractStoriesWithAI(rawText || JSON.stringify(file.name), userApiKey);
          if (aiResult?.stories?.length > 0) {
              extractedStories = aiResult.stories.map((s: any, idx: number) => ({ ...s, no: idx + 1 }));
          }
        } catch (aiErr: any) {
          const errMsg = aiErr?.message || "";
          if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("현재 AI 모델의 일시적인 사용량 급증으로 분석이 불가능합니다. 잠시 후 다시 시도해주세요. (Error: 429 Resource Exhausted)");
          }
          // 기타 AI 오류는 무시하고 진행 (로컬 파싱 결과가 있다면)
        }
      }

      if (extractedStories.length === 0) {
        throw new Error("스토리를 찾을 수 없습니다. 지원 기법(STAR, CAR, PAR, SOAR, SAR 등) 형식이 명확하게 포함되어 있는지 확인하거나, 파일의 텍스트가 복사 가능한 상태인지 확인해주세요.");
      }

      setStories(extractedStories);
      
      const allKeywords = extractedStories.flatMap(s => s.keywords);
      const uniqueKeywords = Array.from(new Set(allKeywords)).slice(0, 6);

      const generatedProfile: AIProfile = {
        keywords: aiResult?.keywords || uniqueKeywords.length > 0 ? uniqueKeywords : Array.from(new Set(extractedStories.map(s => s.competency))).slice(0, 5),
        patterns: aiResult?.patterns || "분석적 사고를 바탕으로 문제의 핵심을 파악하고 실행 가능한 대안을 도출하는 경향이 강함",
        valueSystem: aiResult?.valueSystem || {
          core: ["성취지향", "문제해결"],
          target: ["고객 가치 실현", "기술 혁신"],
          instrumental: ["데이터 기반 분석", "협업 지향성"]
        },
        resultStyle: aiResult?.resultStyle || "구체적인 수치와 지표를 활용하여 성과를 증명하는 정량적 서술 스타일"
      };
      setProfile(generatedProfile);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "파일 파싱 중 오류가 발생했습니다.");
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight leading-tight">스토리뱅크 파일을 <br className="sm:hidden" /> 업로드해주세요</h2>
          <p className="text-ink-muted dark:text-slate-400 text-base font-medium leading-relaxed">
            AI가 당신의 소중한 가치와 경험을 정밀 분석합니다. <br className="hidden sm:block" />
            V.A.L.U.E 체계를 통해 당신의 역량을 한 눈에 정리해드립니다.
          </p>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group h-[220px] rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${
            error 
              ? 'bg-red-50 dark:bg-red-950/20 ring-2 ring-red-400' 
              : file 
                ? 'bg-brand/5 ring-4 ring-brand/10' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/5'
          }`}
        >
          {!file && !isParsing && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-light/10 blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          
          {isParsing ? (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-brand animate-spin" />
                <div className="absolute inset-0 blur-xl bg-brand/20 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-ink dark:text-white uppercase tracking-widest">Processing</p>
                <p className="text-xs font-bold text-ink-muted">가치 체계와 경험을 정밀 해독하고 있습니다...</p>
              </div>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-4 relative z-10 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-black text-ink dark:text-white text-lg">{file.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="rail-label text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="rail-label text-emerald-500 font-bold">READY FOR ANALYSIS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-brand/5 border border-brand/10 text-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Paperclip className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-black text-ink dark:text-white">클릭하거나 파일을 여기로 드래그 하세요</p>
                <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">PDF, Excel Support &middot; Max 10MB</p>
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-4 flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest mx-4 text-center"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.div>
          )}
        </div>
      </section>

      {stories.length > 0 && profile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 pt-4"
        >
          {/* Value System Analysis Section */}
          <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="rail-label">AI Value Intelligence Report</h3>
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest px-2 py-0.5 rounded bg-brand/5">Generated System</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Core Values */}
                <div className="card p-8 bg-paper dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative z-10 flex flex-col h-full gap-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                            <Trophy className="w-5 h-5" />
                         </div>
                         <h4 className="text-lg font-black text-ink dark:text-white">핵심가치</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {profile.valueSystem.core.map((v, i) => (
                           <span key={i} className="px-3 py-1.5 bg-brand/5 text-brand text-[11px] font-black rounded-lg border border-brand/10 uppercase tracking-widest">{v}</span>
                         ))}
                      </div>
                      <p className="text-xs font-bold text-ink-muted/70 leading-relaxed mt-auto">지원자가 인생과 일에서 가장 중요하게 생각하는 원칙</p>
                   </div>
                </div>

                {/* Target Values */}
                <div className="card p-8 bg-paper dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative z-10 flex flex-col h-full gap-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Target className="w-5 h-5" />
                         </div>
                         <h4 className="text-lg font-black text-ink dark:text-white">목표가치</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {profile.valueSystem.target.map((v, i) => (
                           <span key={i} className="px-3 py-1.5 bg-amber-500/5 text-amber-600 text-[11px] font-black rounded-lg border border-amber-500/10 uppercase tracking-widest">{v}</span>
                         ))}
                      </div>
                      <p className="text-xs font-bold text-ink-muted/70 leading-relaxed mt-auto">지원자가 프로젝트를 통해 궁극적으로 달성하고자 하는 지점</p>
                   </div>
                </div>

                {/* Instrumental Values */}
                <div className="card p-8 bg-paper dark:bg-slate-900 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative z-10 flex flex-col h-full gap-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Hammer className="w-5 h-5" />
                         </div>
                         <h4 className="text-lg font-black text-ink dark:text-white">수단가치</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {profile.valueSystem.instrumental.map((v, i) => (
                           <span key={i} className="px-3 py-1.5 bg-emerald-500/5 text-emerald-600 text-[11px] font-black rounded-lg border border-emerald-500/10 uppercase tracking-widest">{v}</span>
                         ))}
                      </div>
                      <p className="text-xs font-bold text-ink-muted/70 leading-relaxed mt-auto">목표 달성을 위해 주로 사용하는 전략적 행동 방식</p>
                   </div>
                </div>
             </div>

          </section>

          {/* Details Toggle Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <button 
               onClick={() => setShowDetails(!showDetails)}
               className="flex items-center gap-3 mx-auto px-6 py-3 rounded-full bg-slate-50 dark:bg-slate-900 text-[11px] font-black text-ink-muted hover:text-brand transition-all uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-800"
             >
                <Layers className={`w-4 h-4 ${showDetails ? 'text-brand' : ''}`} />
                {showDetails ? "Hide Experience Details" : "View Story Details (SB)"}
             </button>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.section 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                 <div className="flex items-center justify-between px-2">
                    <h3 className="rail-label">Extracted Experiences ({stories.length})</h3>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {stories.map((s, idx) => (
                      <div key={idx} className="card p-6 card-hover group">
                        <div className="flex items-start justify-between gap-4">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-brand uppercase tracking-widest">{s.competency}</span>
                              <h5 className="font-bold text-ink dark:text-slate-100 group-hover:text-brand transition-colors">{s.result || s.action}</h5>
                           </div>
                           <button 
                              onClick={() => setExpandedStory(expandedStory === idx ? null : idx)}
                              className="p-1.5 rounded-lg hover:bg-brand/10 transition-colors"
                           >
                              <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform ${expandedStory === idx ? 'rotate-180 text-brand' : ''}`} />
                           </button>
                        </div>
                        <AnimatePresence>
                          {expandedStory === idx && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-4"
                            >
                               {[
                                 { label: "Situation/Problem", content: s.situation },
                                 { label: "Action/Effort", content: s.action }
                               ].map((part) => (
                                 <div key={part.label} className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{part.label}</label>
                                    <p className="text-xs font-medium text-ink-muted dark:text-slate-400 leading-relaxed">{part.content || "-"}</p>
                                 </div>
                               ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                 </div>
              </motion.section>
            )}
          </AnimatePresence>

          <button
            onClick={() => onComplete(stories, profile, file!)}
            className="btn-primary w-full py-6 text-xl shadow-2xl shadow-brand/20 group cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3">
               분석 계속하기
               <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}

      <section className="pt-20">
        <div className="card p-10 bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
           <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">Recommended</div>
              <h4 className="text-2xl font-black tracking-tight">아직 스토리뱅크가 없으신가요?</h4>
              <p className="text-sm text-ink-muted dark:text-slate-400 font-medium leading-relaxed">
                The Story Bank에서 나만의 경험을 AI로 한 단계 더 정밀하게 자동 기록해보세요. <br className="hidden lg:block" />
                기급별 최적화된 형식으로 기록된 데이터는 더욱 강력한 컬쳐핏 분석을 가능하게 합니다.
              </p>
           </div>
           <button 
              onClick={() => window.open('https://thestorybank.co.kr/', '_blank')}
              className="btn-secondary px-8 py-5 whitespace-nowrap flex items-center gap-3 group"
           >
              파일 생성하러 가기
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-brand" />
           </button>
        </div>
      </section>
    </div>
  );
}
