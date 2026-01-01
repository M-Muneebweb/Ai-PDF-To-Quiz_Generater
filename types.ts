export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  timeLimitSeconds: number;
}

export interface QuizSettings {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: {
    questionId: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
}

export enum AppStep {
  SETUP = 'SETUP', // API Key & Model
  UPLOAD_CONFIG = 'UPLOAD_CONFIG', // PDF & Settings
  GENERATING = 'GENERATING', // Calling AI
  QUIZ = 'QUIZ', // Playing
  RESULTS = 'RESULTS' // Summary
}

export interface OpenRouterModel {
  id: string;
  name: string;
}
