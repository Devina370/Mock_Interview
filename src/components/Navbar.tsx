import React from 'react';
import { Sparkles, Volume2, VolumeX, RotateCcw, Briefcase, Award } from 'lucide-react';
import { RoleSetup } from '../types';

interface NavbarProps {
  roleSetup: RoleSetup | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onResetSession: () => void;
  activeQuestionIndex?: number;
  totalQuestions?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  roleSetup,
  voiceEnabled,
  onToggleVoice,
  onResetSession,
  activeQuestionIndex,
  totalQuestions,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">Ascent</span>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                AI Career Coach
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Executive Mock Interviews & Objective Scoring
            </p>
          </div>
        </div>

        {/* Current Role Context Badge (if active) */}
        {roleSetup && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-900 truncate max-w-[200px]">
              {roleSetup.role}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{roleSetup.seniority}</span>
            {typeof activeQuestionIndex === 'number' && totalQuestions && (
              <>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-indigo-600">
                  Q{activeQuestionIndex + 1}/{totalQuestions}
                </span>
              </>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Coach Voice Toggle */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Mute AI Coach Voice' : 'Enable AI Coach Voice'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              voiceEnabled
                ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/80'
            }`}
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Coach Voice: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Coach Voice: Off</span>
              </>
            )}
          </button>

          {/* New Session Button */}
          {roleSetup && (
            <button
              onClick={onResetSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="Start a new mock interview session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
