import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { Timer, ArrowRight, CheckCircle, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizGameProps {
  questions: QuizQuestion[];
  onFinish: (result: QuizResult) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuizResult['answers']>([]);
  const [timeLeft, setTimeLeft] = useState(questions[0].timeLimitSeconds);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleFinish = useCallback((finalAnswers: QuizResult['answers']) => {
    const score = finalAnswers.reduce((acc, curr) => (curr.isCorrect ? acc + 1 : acc), 0);
    onFinish({
      score,
      total: questions.length,
      answers: finalAnswers,
    });
  }, [questions.length, onFinish]);

  const handleNext = useCallback(() => {
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
    const newAnswers = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        selectedOptionIndex: selectedOption ?? -1,
        isCorrect: isCorrect && selectedOption !== null,
      },
    ];

    if (currentIndex + 1 < questions.length) {
      setUserAnswers(newAnswers);
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(questions[currentIndex + 1].timeLimitSeconds);
    } else {
      handleFinish(newAnswers);
    }
  }, [currentQuestion, selectedOption, userAnswers, currentIndex, questions, handleFinish]);

  // Timer
  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused, handleNext]);


  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
         <div className="flex-1 mr-8">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-xs font-bold text-slate-400">{Math.round(progress)}% completed</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-sm">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
            </div>
         </div>
         <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold shadow-sm border transition-colors duration-300 ${
            timeLeft < 10 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-white text-slate-700 border-slate-100'
         }`}>
            <Timer className="w-5 h-5" />
            {timeLeft}s
         </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-3xl p-8 md:p-12 min-h-[450px] flex flex-col justify-between"
      >
        <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                {currentQuestion.text}
            </h3>

            <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group relative
                            ${selectedOption === idx 
                                ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-md ring-1 ring-blue-500/20' 
                                : 'border-transparent bg-white/60 hover:bg-white/90 text-slate-700 hover:shadow-md'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors
                                ${selectedOption === idx ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}
                            `}>
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-medium text-lg">{option}</span>
                            {selectedOption === idx && (
                                <CheckCircle className="ml-auto w-5 h-5 text-blue-500" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-10 flex justify-end">
            <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            >
                {currentIndex === questions.length - 1 ? (
                    <>Finish Quiz <Flag className="w-5 h-5" /></>
                ) : (
                    <>Next Question <ArrowRight className="w-5 h-5" /></>
                )}
            </button>
        </div>
      </motion.div>
      </AnimatePresence>
    </div>
  );
};