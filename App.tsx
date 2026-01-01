import React, { useState } from 'react';
import { AppStep, QuizQuestion, QuizResult, QuizSettings } from './types';
import { SetupStep } from './components/SetupStep';
import { UploadConfigStep } from './components/UploadConfigStep';
import { QuizGame } from './components/QuizGame';
import { ResultView } from './components/ResultView';
import { generateQuiz } from './services/api';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleSetupComplete = (key: string, model: string) => {
    setApiKey(key);
    setModelId(model);
    setStep(AppStep.UPLOAD_CONFIG);
  };

  const handleStartGeneration = async (text: string, settings: QuizSettings) => {
    setStep(AppStep.GENERATING);
    setError('');
    
    try {
      const generatedQuestions = await generateQuiz(apiKey, modelId, text, settings);
      setQuestions(generatedQuestions);
      setStep(AppStep.QUIZ);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating the quiz.');
      setStep(AppStep.UPLOAD_CONFIG);
    }
  };

  const handleQuizFinish = (result: QuizResult) => {
    setQuizResult(result);
    setStep(AppStep.RESULTS);
  };

  const handleRestart = () => {
    setQuestions([]);
    setQuizResult(null);
    setStep(AppStep.UPLOAD_CONFIG);
  };

  const handleBackToSetup = () => {
    setStep(AppStep.SETUP);
    setError('');
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Global Header */}
      <header className="max-w-4xl mx-auto mb-12 text-center animate-fade-in relative">
        {step === AppStep.UPLOAD_CONFIG && (
            <button 
                onClick={handleBackToSetup}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700 transition-colors hidden sm:block"
                title="Change API Key"
            >
                <ArrowLeft />
            </button>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4 drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">AI</span> Quiz Generator
        </h1>
        <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
          Transform your PDF documents into interactive mastery checks instantly.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">
        {step === AppStep.SETUP && (
          <SetupStep onComplete={handleSetupComplete} />
        )}

        {step === AppStep.UPLOAD_CONFIG && (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-100/80 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 shadow-sm backdrop-blur-sm animate-fade-in">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold">Generation Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            <UploadConfigStep onStartGeneration={handleStartGeneration} />
          </>
        )}

        {step === AppStep.GENERATING && (
          <div className="glass-card p-16 rounded-3xl text-center animate-fade-in max-w-xl mx-auto">
            <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Analyzing Content</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
                Our AI is reading your PDF and crafting challenging questions just for you. This might take a moment.
            </p>
          </div>
        )}

        {step === AppStep.QUIZ && questions.length > 0 && (
          <QuizGame questions={questions} onFinish={handleQuizFinish} />
        )}

        {step === AppStep.RESULTS && quizResult && (
          <ResultView 
            result={quizResult} 
            questions={questions} 
            onRestart={handleRestart} 
          />
        )}
      </main>
      
      <footer className="mt-16 text-center text-slate-400 text-sm font-medium">
        <p>© 2024 AI Quiz Generator • Powered by OpenRouter</p>
      </footer>
    </div>
  );
};

export default App;