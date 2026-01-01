import React, { useState } from 'react';
import { validateApiKey, fetchModels } from '../services/api';
import { KeyRound, CheckCircle2, AlertCircle, Bot, Loader2, ChevronRight, ExternalLink } from 'lucide-react';

interface SetupStepProps {
  onComplete: (apiKey: string, modelId: string) => void;
}

export const SetupStep: React.FC<SetupStepProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [keyValid, setKeyValid] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelError, setModelError] = useState('');

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setKeyError('Please enter your API Key');
      return;
    }
    setIsValidatingKey(true);
    setKeyError('');
    
    try {
      const valid = await validateApiKey(apiKey);
      if (valid) {
        setKeyValid(true);
        try {
            const models = await fetchModels(apiKey);
            if (models.length > 0) {
                setAvailableModels(models);
            }
        } catch(e) {
            console.error("Failed to fetch models", e);
        }
      } else {
        setKeyError('Invalid API Key');
      }
    } catch (err) {
      setKeyError('Connection failed');
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleNext = () => {
    if (!modelId.trim()) {
      setModelError('Please enter a Model ID');
      return;
    }
    onComplete(apiKey, modelId);
  };

  return (
    <div className="glass-card max-w-lg mx-auto p-8 rounded-3xl animate-slide-up transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Bot size={120} />
      </div>

      <div className="text-center mb-10 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
          <KeyRound className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Connect AI</h2>
        <p className="text-slate-500 mt-2 text-sm font-medium">Configure OpenRouter to power your quizzes</p>
      </div>
      
      {/* API Key Section */}
      <div className="mb-6 space-y-2 relative z-10">
        <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            OpenRouter API Key
            </label>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-semibold">
                Get Key <ExternalLink size={10} />
            </a>
        </div>
        <div className="relative group">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
                setApiKey(e.target.value);
                setKeyValid(false);
                setKeyError('');
            }}
            placeholder="sk-or-..."
            className={`w-full pl-4 pr-24 py-4 bg-white/50 border-2 rounded-xl outline-none transition-all font-mono text-sm shadow-sm backdrop-blur-sm
              ${keyError ? 'border-red-300 bg-red-50/50' : keyValid ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 focus:border-blue-500 focus:bg-white'}
            `}
            disabled={keyValid}
          />
          <div className="absolute right-2 top-2 h-[calc(100%-16px)]">
             {!keyValid ? (
                <button
                    onClick={handleValidateKey}
                    disabled={isValidatingKey || !apiKey}
                    className="h-full px-4 bg-slate-900 text-white rounded-lg hover:bg-black disabled:opacity-50 text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    {isValidatingKey ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                    ) : 'Validate'}
                </button>
             ) : (
                <button onClick={() => { setKeyValid(false); setAvailableModels([]); }} className="h-full px-3 text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1 bg-emerald-100/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold">Valid</span>
                </button>
             )}
          </div>
        </div>
        {keyError && (
            <div className="flex items-center gap-1 text-red-500 text-xs font-semibold ml-1 animate-in slide-in-from-top-1 fade-in">
                <AlertCircle size={12} /> {keyError}
            </div>
        )}
      </div>

      {/* Model ID Section */}
      <div className={`transition-all duration-500 ease-in-out relative z-10 ${keyValid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="mb-8 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Model ID
            </label>
            <div className="relative">
              <input
                  list="models-list"
                  type="text"
                  value={modelId}
                  onChange={(e) => {
                      setModelId(e.target.value);
                      setModelError('');
                  }}
                  placeholder="Select a model..."
                  className="w-full p-4 bg-white/50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
              <datalist id="models-list">
                  {availableModels.length > 0 ? (
                      availableModels.map(m => <option key={m} value={m} />)
                  ) : (
                      <>
                      <option value="openai/gpt-3.5-turbo" />
                      <option value="openai/gpt-4o-mini" />
                      <option value="anthropic/claude-3-haiku" />
                      <option value="google/gemini-flash-1.5" />
                      <option value="meta-llama/llama-3-8b-instruct" />
                      </>
                  )}
              </datalist>
            </div>
            {modelError && <p className="text-red-500 text-xs font-semibold ml-1">{modelError}</p>}
            <p className="text-[10px] text-slate-400 ml-1">
                Recommendation: Use <span className="font-mono text-slate-600">openai/gpt-4o-mini</span> or <span className="font-mono text-slate-600">google/gemini-flash-1.5</span> for best results.
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={20} />
          </button>
      </div>
    </div>
  );
};