/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface STARStory {
  no: number;
  competency: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  keywords: string[];
}

export interface AIProfile {
  keywords: string[];
  patterns: string;
  valueSystem: {
    core: string[];        // 핵심가치
    target: string[];      // 목표가치
    instrumental: string[]; // 수단가치
  };
  resultStyle: string;
}

export interface TargetConditions {
  jobs: string[];
  customJob: string;
  companySizes: string[];
  targetCompany?: string;
}

export interface CompanyAnalysis {
  rank: number;
  name: string;
  industry: string;
  size: string;
  score: number;
  subScores: {
    culture: number;
    ceo: number;
    review: number;
  };
  matchedStories: string[];
  matchedExperienceDetail: string; // 지원자의 SB 경험 스토리와 매칭 포인트
  cultureAnalysis: string; // 조직문화/인재상 분석 근거
  ceoAnalysis: string; // CEO 철학/경영 방침 분석 근거
  reviewAnalysis: string; // 재직자 평판/실제 근무 환경 분석 근거
  evidenceSummary: string; // 종합 근거 요약
  reliability: 'Verified' | 'Reference';
  sources: { title: string; url: string; reliability: 'verified' | 'unverified' }[];
  appealPoint: string;
  caution: string;
}
