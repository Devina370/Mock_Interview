import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReadinessReport, InterviewTurn, RoleSetup } from '../types';

interface ReadinessScorecardProps {
  report: ReadinessReport;
  turns: InterviewTurn[];
  roleSetup: RoleSetup;
  onRestart: () => void;
}

export const ReadinessScorecard: React.FC<ReadinessScorecardProps> = ({
  report,
  turns,
  roleSetup,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedTurnId, setExpandedTurnId] = useState<string | null>(null);

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'Strong Hire':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          badge: 'bg-emerald-600 text-white',
          accent: 'from-emerald-500 to-teal-600',
        };
      case 'Hire':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          badge: 'bg-indigo-600 text-white',
          accent: 'from-indigo-600 to-sky-600',
        };
      case 'Leaning Hire':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          badge: 'bg-amber-600 text-white',
          accent: 'from-amber-500 to-orange-600',
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          badge: 'bg-rose-600 text-white',
          accent: 'from-rose-500 to-red-600',
        };
    }
  };

  const style = getVerdictStyle(report.hiringVerdict);

  const handleCopyReport = () => {
    const textReport = `===========================================
ASCENT AI CAREER COACH - INTERVIEW SCORECARD
===========================================
Candidate Role: ${roleSetup.role} (${roleSetup.seniority})
Target Industry / Company: ${roleSetup.industry} - ${roleSetup.company}
Overall Performance Score: ${report.overallScore.toFixed(1)} / 10.0
Recommendation: ${report.hiringVerdict}
STAR Method Mastery: ${report.starMethodMastery.rating}

EXECUTIVE SUMMARY:
${report.executiveSummary}

KEY STRENGTHS:
${report.topStrengths.map((s) => `• ${s}`).join('\n')}

PRIMARY GROWTH AREAS:
${report.primaryGrowthAreas.map((g) => `• ${g}`).join('\n')}

48-HOUR ACTION PLAN:
${report.tailoredActionPlan.map((a, i) => `${i + 1}. ${a}`).join('\n')}

TRANSCRIPT BREAKDOWN:
${turns
  .map(
    (t, i) => `
Q${i + 1} [${t.questionCategory}]: ${t.question}
Score: ${t.evaluation?.score.toFixed(1)} / 10
Your Answer: ${t.userAnswer || 'N/A'}
Strengths: ${t.evaluation?.strengths.join(', ')}
Suggestions: ${t.evaluation?.improvementSuggestions.join(', ')}
`
  )
  .join('\n-------------------------------------------\n')}
`;
    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className={`p-8 bg-gradient-to-r ${style.accent} text-white`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Mock Interview Complete</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Candidate Readiness Scorecard
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-1">
                {roleSetup.role} • {roleSetup.seniority} • {roleSetup.industry}
              </p>
            </div>

            {/* Score & Verdict */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 shrink-0">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black">
                  {report.overallScore.toFixed(1)}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                  Overall Score / 10
                </div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <div className="text-sm sm:text-base font-bold">{report.hiringVerdict}</div>
                <div className="text-[10px] text-white/70">Hiring Decision</div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Debrief */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Coach Executive Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {report.executiveSummary}
            </p>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Demonstrated Strengths
              </h3>
              <ul className="space-y-2">
                {report.topStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Primary Growth Areas
              </h3>
              <ul className="space-y-2">
                {report.primaryGrowthAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* STAR Method Mastery & 48-Hour Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* STAR Assessment */}
            <div className="p-5 rounded-xl bg-indigo-50/40 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  STAR Framework Mastery
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {report.starMethodMastery.rating}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {report.starMethodMastery.critique}
              </p>
            </div>

            {/* 48-Hour Action Plan */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                48-Hour Practice Action Plan
              </h3>
              <ul className="space-y-1.5">
                {report.tailoredActionPlan.map((plan, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-indigo-600 font-bold shrink-0">{idx + 1}.</span>
                    <span>{plan}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Review Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Session Transcript & Per-Question Evaluation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your answers, scores, and coach feedback for all {turns.length} questions.
            </p>
          </div>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {turns.map((turn, index) => {
            const isExpanded = expandedTurnId === turn.id;
            return (
              <div
                key={turn.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedTurnId(isExpanded ? null : turn.id)}
                  className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {turn.question}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                        {turn.questionCategory}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {turn.evaluation && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        {turn.evaluation.score.toFixed(1)} / 10
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-200 space-y-4 text-xs">
                    <div>
                      <div className="font-semibold text-slate-500 uppercase text-[10px] mb-1">
                        Your Submitted Response:
                      </div>
                      <p className="p-3 rounded-lg bg-slate-50 text-slate-800 italic leading-relaxed border border-slate-100">
                        "{turn.userAnswer}"
                      </p>
                    </div>

                    {turn.evaluation && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="font-bold text-emerald-800 text-[11px] block mb-1">
                            Strengths:
                          </span>
                          <ul className="space-y-1 text-slate-700">
                            {turn.evaluation.strengths.map((s, idx) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="font-bold text-amber-800 text-[11px] block mb-1">
                            Suggestions for Improvement:
                          </span>
                          <ul className="space-y-1 text-slate-700">
                            {turn.evaluation.improvementSuggestions.map((s, idx) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Restart Action */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Another Mock Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
