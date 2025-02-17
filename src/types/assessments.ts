interface Scale {
  max: number;
  min: number;
}

interface Calculations {
  type: string;
}

export interface Strategy {
  scale: Scale;
  calculations: Calculations;
}

export interface Question {
  id?: number;
  question: string;
  assessment_id?: string;
  metadata?: any;
}

interface ResultsSchemaProperties {
  openness: { type: string };
  neuroticism: { type: string };
  extraversion: { type: string };
  agreeableness: { type: string };
  conscientiousness: { type: string };
}

export interface ResultsSchema {
  type: string;
  required: string[];
  properties: ResultsSchemaProperties;
}

export interface Results {
  openness: number;
  neuroticism: number;
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
}

export interface Evaluation {
  results: Results;
  assessment_id?: string | null;
  created_at?: string;
  id?: string;
  is_completed?: boolean;

  user_id?: string;
  workplace_id?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface Assessment {
  id: string;
  type: string;
  strategy: Strategy;
  results_schema: ResultsSchema;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  estimated_time: string;
  cover_url: string | null;
  questions: Question[];
  active: boolean;
}

