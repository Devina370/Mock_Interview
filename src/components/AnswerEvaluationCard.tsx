import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { EvaluationResult, InterviewTurn } from '../types';

interface AnswerEvaluationCardProps {
  evaluation: EvaluationResult;
  questionNumber: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  nextQuestion?: string;
  nextQuestionCategory?: string;
  transitionRationale?: string;
  onProceed: () => void;
  onRetry: () => void;
  onFinishEarly: () => void;
  onPlayFeedbackAudio: (text: string) => void;
  isAudioPlaying: boolean;
}

export const AnswerEvaluationCard: React.FC<AnswerEvaluationCardProps> = ({
  evaluation,
  questionNumber,
  totalQuestions,
  isLastQuestion,
  nextQuestion,
  nextQuestionCategory,
  transitionRationale,
  onProceed,
  onRetry,
  onFinishEarly,
  onPlayFeedbackAudio,
  isAudioPlaying,
}) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const getScoreTheme = (score: number) => {
    if (score >= 8.5) {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        verdict: 'Exceptional Response',
        barColor: 'bg-emerald-500',
      };
    }
    if (score >= 7.0) {
      return {
        text: 'text-indigo-700',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        badge: 'bg-indigo-600 text-white',
        verdict: 'Competitive & Strong',
        barColor: 'bg-indigo-600',
      };
    }
    if (score >= 5.5) {
      return {
        text: 'text-amber-800',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-600 text-white',
        verdict: 'Solid Foundation (Room to Elevate)',
        barColor: 'bg-amber-500',
      };
    }
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-600 text-white',
      verdict: 'Needs Restructuring',
      barColor: 'bg-rose-500',
    };
  };

  const theme = getScoreTheme(evaluation.score);

  const handleListenFeedback = () => {
    const feedbackSummary = `Score: ${evaluation.score} out of 10. ${
      evaluation.coachInsight
    } What you did well: ${evaluation.strengths.slice(0, 2).join('. ')}. Key suggestion: ${
      evaluation.improvementSuggestions[0] || ''
    }`;
    onPlayFeedbackAudio(feedbackSummary);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Score Header Banner */}
      <div className={`p-6 border-b ${theme.border} ${theme.bg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
              <span className={`text-2xl font-black tracking-tight ${theme.text}`}>
                {evaluation.score.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                out of 10
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
                  {theme.verdict}
                </span>
                <span className="text-xs text-slate-500">
                  Question {questionNumber} of {totalQuestions} Evaluation
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Objective Coach Evaluation
              </h3>
            </div>
          </div>

          <button
            onClick={handleListenFeedback}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
              isAudioPlaying
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isAudioPlaying ? 'Playing Audio...' : 'Listen to Coach Feedback'}</span>
          </button>
        </div>

        {/* 4-Metric Breakdown Bars */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/60">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-medium">Relevance</span>
              <span className="font-bold text-slate-900">
                {evaluation.scoreBreakdown.contentAndRelevance.toFixed(1)}/10
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${theme.barColor} transition-all duration-500`}
                style={{ width: `${(evaluation.scoreBreakdown.contentAndRelevance / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-medium">Structure (STAR)</span>
              <span className="font-bold text-slate-900">
                {evaluation.scoreBreakdown.structureAndClarity.toFixed(1)}/10
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${theme.barColor} transition-all duration-500`}
                style={{ width: `${(evaluation.scoreBreakdown.structureAndClarity / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-medium">Impact & Metrics</span>
              <span className="font-bold text-slate-900">
                {evaluation.scoreBreakdown.impactAndMetrics.toFixed(1)}/10
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${theme.barColor} transition-all duration-500`}
                style={{ width: `${(evaluation.scoreBreakdown.impactAndMetrics / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-medium">Executive Tone</span>
              <span className="font-bold text-slate-900">
                {evaluation.scoreBreakdown.executiveTone.toFixed(1)}/10
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${theme.barColor} transition-all duration-500`}
                style={{ width: `${(evaluation.scoreBreakdown.executiveTone / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Feedback Content */}
      <div className="p-6 space-y-6">
        {/* Coach Insight */}
        {evaluation.coachInsight && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Coach Commentary & Hiring Manager Perspective
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {evaluation.coachInsight}
            </p>
          </div>
        )}

        {/* Two Columns: Strengths & Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* What You Did Well */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What You Did Well (Strengths)
            </div>
            <ul className="space-y-2.5">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constructive Suggestions */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Specific Suggestions for Improvement
            </div>
            <ul className="space-y-2.5">
              {evaluation.improvementSuggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Model Answer Accordion */}
        {evaluation.modelAnswerSnippet && (
          <div className="border border-indigo-100 rounded-xl overflow-hidden bg-indigo-50/20">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-indigo-900 hover:bg-indigo-50/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                How a Top 1% Candidate Would Frame This (Model Answer)
              </span>
              <span className="text-indigo-600 flex items-center gap-1 text-[11px]">
                {showModelAnswer ? 'Collapse' : 'View Model Answer'}
                {showModelAnswer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {showModelAnswer && (
              <div className="p-4 bg-white border-t border-indigo-100 text-xs text-slate-700 leading-relaxed space-y-2">
                <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                  Example High-Impact Delivery:
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {evaluation.modelAnswerSnippet}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Question / Transition Card */}
        {!isLastQuestion && nextQuestion && (
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                Next Logical Question ({nextQuestionCategory || 'Follow-up'})
              </span>
              <span className="text-xs text-slate-400">
                Question {questionNumber + 1} of {totalQuestions}
              </span>
            </div>

            {transitionRationale && (
              <p className="text-xs text-indigo-200/90 mb-3 italic">
                "{transitionRationale}"
              </p>
            )}

            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
              {nextQuestion}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors w-full sm:w-auto"
              title="Apply this feedback and retry this specific question to improve your score"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry This Question</span>
            </button>

            {questionNumber >= 2 && !isLastQuestion && (
              <button
                onClick={onFinishEarly}
                className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4 px-2 py-1"
              >
                Conclude & View Full Scorecard
              </button>
            )}
          </div>

          <button
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLastQuestion ? (
              <>
                <span>Complete Interview & View Final Scorecard</span>
                <Award className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Proceed to Question {questionNumber + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
