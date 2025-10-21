export interface FactResult {
  facts: string[];
  related_topics: string[];
}

export interface ExamInfoResult {
  description: string;
  apply_start_date: string;
  apply_end_date: string;
  exam_pattern: string;
  syllabus: string;
}

export type Language = 'en' | 'hi';