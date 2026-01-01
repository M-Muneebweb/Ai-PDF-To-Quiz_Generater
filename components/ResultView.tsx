import React from 'react';
import { QuizResult, QuizQuestion } from '../types';

interface ResultViewProps {
  result: QuizResult;
  questions: QuizQuestion[];
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, questions, onRestart }) => {
  const percentage = Math.round((result.score / result.total) * 100);

  let message = '';
  let subMessage = '';
  let colorClass = '';

  if (percentage >= 80) {
    message = 'Outstanding!';
    subMessage = 'You clearly know your stuff.';
    colorClass = 'text-emerald-600';
  } else if (percentage >= 60) {
    message = 'Good Job!';
    subMessage = 'Solid effort, keep it up.';
    colorClass = 'text-blue-600';
  } else {
    message = 'Keep Practicing!';
    subMessage = 'Review the material and try again.';
    colorClass = 'text-orange-500';
  }

  return (
    <div className="glass-card max-w-4xl mx-auto rounded-3xl overflow-hidden animate-slide-up">
      {/* Header Stats */}
      <div className="bg-white/40 p-10 text-center border-b border-white/50">
        <div className="mb-6">
            <h2 className={`text-4xl font-extrabold mb-2 ${colorClass}`}>{message}</h2>
            <p className="text-slate-500 font-medium">{subMessage}</p>
        </div>
        
        <div className="flex justify-center gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-[140px]">
                <div className="text-4xl font-black text-slate-800">{result.score}<span className="text-xl text-slate-400 font-bold">/{result.total}</span></div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">Total Score</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-[140px]">
                <div className="text-4xl font-black text-slate-800">{percentage}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">Accuracy</div>
            </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="p-8 md:p-10 bg-white/30">
        <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Detailed Review
        </h3>
        <div className="space-y-6">
            {questions.map((q, idx) => {
                const userAnswer = result.answers.find(a => a.questionId === q.id);
                const isCorrect = userAnswer?.isCorrect;
                const userSelectedIndex = userAnswer?.selectedOptionIndex ?? -1;

                return (
                    <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4 gap-4">
                            <h4 className="font-semibold text-slate-800 text-lg">
                                <span className="text-slate-400 mr-3 font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                                {q.text}
                            </h4>
                            {isCorrect ? (
                                <span className="flex-shrink-0 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Correct
                                </span>
                            ) : (
                                <span className="flex-shrink-0 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Incorrect
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 pl-8">
                            {q.options.map((opt, optIdx) => {
                                let itemClass = "p-3 rounded-lg text-sm border flex justify-between items-center";
                                if (optIdx === q.correctAnswerIndex) {
                                    itemClass = "bg-emerald-50 text-emerald-900 font-semibold border-emerald-200";
                                } else if (optIdx === userSelectedIndex && !isCorrect) {
                                    itemClass = "bg-red-50 text-red-900 font-semibold border-red-200";
                                } else {
                                    itemClass = "bg-slate-50 text-slate-500 border-transparent opacity-70";
                                }

                                return (
                                    <div key={optIdx} className={itemClass}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold opacity-50">{String.fromCharCode(65 + optIdx)}</span>
                                            {opt}
                                        </div>
                                        {optIdx === q.correctAnswerIndex && <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Correct Answer</span>}
                                        {optIdx === userSelectedIndex && !isCorrect && <span className="text-xs font-bold uppercase tracking-wider text-red-500">Your Answer</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      <div className="p-8 border-t border-white/50 bg-white/40 flex justify-center sticky bottom-0 backdrop-blur-md">
        <button
            onClick={onRestart}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
            Start New Quiz
        </button>
      </div>
    </div>
  );
};