import React, { useState, useRef } from 'react';
import { QuizSettings } from '../types';
import { extractTextFromPdf } from '../services/pdf';
import { FileUp, FileText, X, AlertCircle, Wand2, Loader2, Gauge, HelpCircle } from 'lucide-react';

interface UploadConfigStepProps {
  onStartGeneration: (text: string, settings: QuizSettings) => void;
}

export const UploadConfigStep: React.FC<UploadConfigStepProps> = ({ onStartGeneration }) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setPdfError('Please upload a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setPdfError('');
    setIsProcessingPdf(true);

    try {
      const text = await extractTextFromPdf(selectedFile);
      if (text.length < 50) {
         setPdfError('The PDF contains very little text. It might be an image-only PDF.');
         setFile(null);
      } else {
         setExtractedText(text);
      }
    } catch (err) {
      setPdfError('Failed to read PDF. ' + (err as Error).message);
      setFile(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleGenerate = () => {
    if (!extractedText) return;
    onStartGeneration(extractedText, { difficulty, questionCount });
  };

  return (
    <div className="glass-card max-w-2xl mx-auto p-8 rounded-3xl animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">2</span>
        Upload Material
      </h2>

      {/* File Upload Area */}
      <div className="mb-8">
        <div 
            className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group relative overflow-hidden
            ${file ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 bg-white/50'}`}
            onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {isProcessingPdf ? (
            <div className="flex flex-col items-center z-10 relative py-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <p className="text-blue-600 font-medium animate-pulse">Extracting text from PDF...</p>
            </div>
          ) : file ? (
             <div className="z-10 relative flex items-center justify-between p-2">
                <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-emerald-900 font-bold text-lg truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <p className="text-emerald-600 text-sm font-medium">Ready to process</p>
                    </div>
                </div>
                <button 
                    className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                >
                    <X size={20} />
                </button>
             </div>
          ) : (
             <div className="z-10 relative py-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                    <FileUp className="w-9 h-9" />
                </div>
                <p className="text-slate-700 font-bold text-lg">Click to upload PDF</p>
                <p className="text-slate-400 text-sm mt-1">or drag and drop here (Max 10MB)</p>
             </div>
          )}
        </div>
        {pdfError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{pdfError}</p>
            </div>
        )}
      </div>

      {/* Configuration Area */}
      <div className={`transition-all duration-500 ${file && !isProcessingPdf && !pdfError ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Gauge size={14} /> Difficulty Level
              </label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                      difficulty === level 
                        ? 'bg-white text-blue-600 shadow-sm transform scale-100' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <HelpCircle size={14} /> Question Count
              </label>
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-slate-700">{questionCount}</span>
                    <span className="text-xs text-slate-400 font-medium uppercase bg-slate-100 px-2 py-1 rounded">Questions</span>
                </div>
                <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Wand2 className="w-6 h-6" />
            Generate Quiz
          </button>
      </div>
    </div>
  );
};