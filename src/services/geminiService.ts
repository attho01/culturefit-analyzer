/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { CompanyAnalysis, STARStory, TargetConditions } from "../types";

export const analyzeCultureFit = async (
  stories: STARStory[],
  conditions: TargetConditions,
  userApiKey?: string
): Promise<CompanyAnalysis[]> => {
  const apiKey = userApiKey || (process.env.GEMINI_API_KEY as string);
  const ai = new GoogleGenAI({ apiKey });

  // 구체적인 분석을 위해 스토리 요약 정보를 강화
  const storySummary = stories.map(s => `- [${s.competency}] 상황: ${s.situation.substring(0, 40)}... / 행동: ${s.action.substring(0, 40)}... / 결과: ${s.result.substring(0, 40)}...`).join('\n');
  const jobCondition = conditions.jobs.length > 0 ? conditions.jobs.join(', ') : conditions.customJob;
  const sizeCondition = conditions.companySizes.join(', ');
  const targetCompanyText = conditions.targetCompany ? `[목표 특정 기업: ${conditions.targetCompany}]` : "";

  const systemInstruction = `
당신은 대한민국 최고의 조직문화 분석 전문가입니다.
단순한 직무 역량 매칭을 넘어, **기업 홈페이지의 인재상(핵심가치), CEO 메시지/경영철학, 실제 조직 문화 및 현직자 리뷰**를 정밀 분석하여 지원자와의 '컬쳐핏'을 평가하세요.

지원자의 스토리뱅크(SB) 데이터와 목표 조건을 바탕으로 컬쳐핏이 가장 높은 기업 5개를 선별하십시오.
${targetCompanyText ? `**중요: 사용자가 특정 목표 기업으로 '${conditions.targetCompany}'을 요청했습니다. 반드시 '${conditions.targetCompany}'을 분석 대상 1순위(Rank 1)로 포함하여 정밀 분석하십시오.**` : ""}

[지원자 데이터 (SB)]
${storySummary}

[목표 조건]
- 직무: ${jobCondition}
- 기업규모: ${sizeCondition}
${conditions.targetCompany ? `- 목표 특정 기업: ${conditions.targetCompany}` : ""}

[분석 가이드라인]
1. **CEO 및 홈페이지 분석**: 실시간 Google Search를 활용하여 해당 기업 CEO의 최근 인터뷰, 신년사, 기업 홈페이지에 게재된 인재상과 핵심 가치를 반드시 확인하세요.
2. **컬쳐핏 비교 분석**: 지원자의 SB 에피소드에서 나타나는 행동 패턴/가치관이 기업의 어떤 핵심 가치나 CEO의 철학과 맞닿아 있는지 '비교 분석' 관점에서 서술하세요.
3. **스코어 근거**: 'culture_match'(기업문화/40점), 'ceo_match'(경영철학/30점), 'review_match'(현직자평판/30점)를 각각 산출하고, 이에 대한 구체적인 근거를 제시하세요.
4. **결과 형식**: 반드시 순수한 JSON 형식으로만 반환하세요.

[가드레일]
- 결과 기업 수는 반드시 5개로 구성하세요.
- **매우 중요**: 'evidence_summary'는 지원자의 특정 SB 스토리명과 기업의 핵심 가치를 직접 연결하여 "지원자의 [A 경험]은 기업의 [B 인재상]과 일치함"과 같은 형식으로 명확히 분석하세요.
- 각 텍스트 필드는 2~3문장 내외로 핵심만 작성하여 토큰 한도를 초과하지 않도록 하세요.
- **절대로** 응답 내용에 [cite: X]와 같은 인용 태그를 포함하지 마세요. 오직 텍스트만 작성하세요.

[결과 JSON 형식]
{
  "companies": [
    {
      "rank": 1,
      "name": "기업명",
      "industry": "산업군",
      "size": "기업규모",
      "culture_fit_score": 92,
      "culture_match": 38,
      "ceo_match": 29,
      "review_match": 25,
      "matched_stories": ["역량명1", "역량명2"],
      "matched_experience_detail": "지원자의 [XX 프로젝트] 성과는 기업의 [YY 가치]와 일치합니다...",
      "culture_analysis": "조직문화 분석 내용...",
      "ceo_analysis": "CEO 철학 분석 내용...",
      "review_analysis": "재직자 평판 분석 내용...",
      "evidence_summary": "최종 요약...",
      "sources": [{"title": "출처명", "url": "링크", "reliability": "verified"}],
      "appeal_point": "어필 포인트",
      "caution": "주의사항"
    }
  ]
}
`;

  try {
    const retryWithDelay = async (fn: () => Promise<any>, retries = 1, delay = 2000): Promise<any> => {
      try {
        return await fn();
      } catch (err: any) {
        if (retries > 0 && (err.message?.includes('429') || err.message?.includes('quota') || err.status === 'RESOURCE_EXHAUSTED')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryWithDelay(fn, retries - 1, delay * 2);
        }
        throw err;
      }
    };

    const callAI = async (useSearch: boolean) => {
      return await (ai as any).models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: "지원자의 스토리뱅크(SB)와 가장 컬쳐핏이 잘 맞는 국내외 기업 5곳을 인재상 및 CEO 철학 기반으로 깊이 있게 비교 분석하여 JSON으로 출력하세요. 인용 태그([cite:X])는 절대 사용하지 마세요." }] }],
        config: {
          systemInstruction,
          tools: useSearch ? [{ googleSearch: {} }] : undefined
        }
      });
    };

    let response;
    try {
      response = await retryWithDelay(() => callAI(true));
    } catch (err: any) {
      // If the error is 429 or RESOURCE_EXHAUSTED, it's highly likely the free tier API key
      // doesn't have quota for Google Search Grounding. Fallback to base model without search.
      if (err.message?.includes('429') || err.message?.includes('quota') || err.status === 'RESOURCE_EXHAUSTED' || err.status === 429) {
        console.warn("Search Grounding quota exceeded or billing not enabled. Falling back to base model without search.");
        response = await retryWithDelay(() => callAI(false));
      } else {
        throw err;
      }
    }

    const text = response.text || '{"companies":[]}';
    
    // Robust JSON extraction and repair
    const extractAndRepairJson = (rawText: string) => {
      // 1. Remove [cite: X] tags which often break JSON parsing if they appear inside strings without proper escaping or as raw text
      let cleanedText = rawText.replace(/\[cite: \d+\]/g, '');

      // 2. Find the JSON block (prefer ```json ... ``` blocks)
      const jsonMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        cleanedText.match(/```\s*([\s\S]*?)\s*```/);
      
      let candidate = jsonMatch ? jsonMatch[1] : cleanedText;

      // 3. Find the first '{' and the last '}' if we don't have a clean block
      if (!jsonMatch) {
        const firstBrace = candidate.indexOf('{');
        const lastBrace = candidate.lastIndexOf('}');
        if (firstBrace !== -1) {
          candidate = candidate.slice(firstBrace, lastBrace !== -1 ? lastBrace + 1 : undefined);
        }
      }
      
      // 4. Escape raw control characters in strings (newlines, tabs etc inside quotes)
      candidate = candidate.replace(/"((?:[^"\\]|\\.)*)"/g, (match) => {
        return match
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      });

      // 5. Simple repair for truncated JSON
      const lastBrace = candidate.lastIndexOf('}');
      if (lastBrace === -1 || !candidate.trim().endsWith('}')) {
        // Count open characters and close them
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let i = 0;
        for (; i < candidate.length; i++) {
          if (candidate[i] === '"' && candidate[i-1] !== '\\') inString = !inString;
          if (!inString) {
            if (candidate[i] === '{') openBraces++;
            if (candidate[i] === '}') openBraces--;
            if (candidate[i] === '[') openBrackets++;
            if (candidate[i] === ']') openBrackets--;
          }
        }
        
        // If it ended abruptly in the middle of a string or key, we might need to back up
        if (inString) {
          candidate += '"';
        }

        while (openBrackets > 0) { candidate += ']'; openBrackets--; }
        while (openBraces > 0) { candidate += '}'; openBraces--; }
      }

      try {
        return JSON.parse(candidate);
      } catch (e) {
        console.error("JSON Parse Error on candidate:", candidate);
        // Fallback to minimal structure if totally broken
        if (candidate.includes('"companies"')) return { companies: [] };
        throw e;
      }
    };

    const data = extractAndRepairJson(text);
    
    return data.companies.map((c: any) => ({
      rank: c.rank,
      name: c.name,
      industry: c.industry,
      size: c.size,
      score: c.culture_fit_score,
      subScores: {
        culture: c.culture_match,
        ceo: c.ceo_match,
        review: c.review_match,
      },
      matchedStories: c.matched_stories || [],
      matchedExperienceDetail: c.matched_experience_detail || "",
      cultureAnalysis: c.culture_analysis || "",
      ceoAnalysis: c.ceo_analysis || "",
      reviewAnalysis: c.review_analysis || "",
      evidenceSummary: c.evidence_summary || "",
      reliability: c.culture_fit_score > 85 ? 'Verified' : 'Reference',
      sources: c.sources || [],
      appealPoint: c.appeal_point || "",
      caution: c.caution || ""
    }));
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
