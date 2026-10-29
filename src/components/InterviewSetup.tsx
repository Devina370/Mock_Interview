import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  TrendingUp,
  Layers,
  Sparkles,
  ChevronRight,
  FileText,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { RoleSetup, SeniorityLevel, InterviewType } from '../types';

interface InterviewSetupProps {
  onStart: (setup: RoleSetup) => Promise<void>;
  isLoading: boolean;
}

interface Preset {
  title: string;
  role: string;
  industry: string;
  company: string;
  seniority: SeniorityLevel;
  interviewType: InterviewType;
  badge: string;
}

const PRESETS: Preset[] = [
  {
    title: 'Senior Software Engineer',
    role: 'Senior Full-Stack Software Engineer',
    industry: 'Technology & Cloud SaaS',
    company: 'Tier 1 Tech / High-growth Scaleup',
    seniority: 'Senior',
    interviewType: 'Comprehensive Mixed',
    badge: 'Popular',
  },
  {
    title: 'Staff Product Manager',
    role: 'Staff Product Manager',
    industry: 'FinTech & Consumer Tech',
    company: 'Stripe / Scaleup',
    seniority: 'Staff / Principal',
    interviewType: 'Behavioral & Leadership',
    badge: 'Executive',
  },
  {
    title: 'Engineering Manager',
    role: 'Engineering Manager (People & Delivery)',
    industry: 'Enterprise Software',
    company: 'Leading Tech Enterprise',
    seniority: 'Manager / Executive',
    interviewType: 'Behavioral & Leadership',
    badge: 'Leadership',
  },
  {
    title: 'Senior Data Scientist',
    role: 'Senior Data Scientist & ML Engineer',
    industry: 'Artificial Intelligence & HealthTech',
    company: 'AI Research / Tech Scaleup',
    seniority: 'Senior',
    interviewType: 'Case Study & Problem Solving',
    badge: 'Specialized',
  },
  {
    title: 'Enterprise Account Executive',
    role: 'Enterprise Account Executive',
    industry: 'B2B SaaS & Cloud',
    company: 'Salesforce / Enterprise Tech',
    seniority: 'Senior',
    interviewType: 'Situational & Values' as any,
    badge: 'Sales',
  },
  {
    title: 'Management Consultant',
    role: 'Engagement Manager / Consultant',
    industry: 'Strategy & Management Consulting',
    company: 'Top-tier Strategy Firm',
    seniority: 'Mid-Level',
    interviewType: 'Case Study & Problem Solving',
    badge: 'Strategy',
  },
];

const INDUSTRIES = [
  'Technology & Cloud SaaS',
  'FinTech & Banking',
  'Healthcare & BioTech',
  'Retail & E-Commerce',
  'Strategy Consulting & Professional Services',
  'Media, Entertainment & Gaming',
  'Energy, Automotive & CleanTech',
  'Consumer Goods & Supply Chain',
];

const SENIORITY_LEVELS: SeniorityLevel[] = [
  'Entry / Junior',
  'Mid-Level',
  'Senior',
  'Staff / Principal',
  'Manager / Executive',
];

const INTERVIEW_TYPES: { type: InterviewType; label: string; desc: string }[] = [
  {
    type: 'Comprehensive Mixed',
    label: 'Comprehensive Mixed',
    desc: 'Balanced blend of behavioral, situational, problem-solving, and role-specific questions.',
  },
  {
    type: 'Behavioral & Leadership',
    label: 'Behavioral & Leadership',
    desc: 'Focus on STAR method, conflict resolution, ownership, and stakeholder management.',
  },
  {
    type: 'Technical & Architecture',
    label: 'Technical & Architecture',
    desc: 'System design, engineering tradeoffs, architecture, and technical depth.',
  },
  {
    type: 'Case Study & Problem Solving',
    label: 'Case Study & Strategy',
    desc: 'Analytical frameworks, metric prioritization, root-cause analysis, and market strategy.',
  },
  {
    type: 'Culture Fit & Values',
    label: 'Culture & Mission Fit',
    desc: 'Alignment with core company principles, motivation, resilience, and working style.',
  },
];

export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, isLoading }) => {
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [company, setCompany] = useState('');
  const [seniority, setSeniority] = useState<SeniorityLevel>('Senior');
  const [interviewType, setInterviewType] = useState<InterviewType>('Comprehensive Mixed');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');

  const handleApplyPreset = (p: Preset) => {
    setRole(p.role);
    setIndustry(p.industry);
    setCompany(p.company);
    setSeniority(p.seniority);
    setInterviewType(p.interviewType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;

    onStart({
      role: role.trim(),
      industry,
      company: company.trim() || 'Industry standard',
      seniority,
      interviewType,
      totalQuestions,
      jobDescription: jobDescription.trim() || undefined,
      resumeSummary: resumeSummary.trim() || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Hero Welcome */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Personalized Career & Interview Coach
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome to your professional mock interview.
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          I will act as your dedicated interview coach. We will practice <strong>one question at a time</strong>, evaluate each of your answers with an objective <strong>score out of 10</strong>, identify your strengths, and provide actionable ways to elevate your delivery.
        </p>
      </div>

      {/* Quick Start Presets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            Quick Start: Choose a Target Role Preset
          </span>
          <span className="text-xs text-slate-400">or customize below</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = role === preset.role;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all text-sm group relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-950">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{preset.industry}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{preset.seniority}</span>
                  <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Select <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Customize Your Interview Target
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tell me about the specific role, industry, or company you are preparing for so I can calibrate the questions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Target Role */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Target Job Title / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, VP of Marketing, Data Architect..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400 text-slate-900 bg-white"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Industry / Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 bg-white"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Company / Profile */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Target Company or Company Stage
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Series B Startup, Google, McKinsey..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400 text-slate-900 bg-white"
              />
            </div>

            {/* Seniority Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Experience / Seniority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SENIORITY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeniority(level)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center border transition-all ${
                      seniority === level
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Length */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Interview Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 3, label: '3 Questions', sub: 'Quick Drill (10m)' },
                  { count: 5, label: '5 Questions', sub: 'Standard (20m)' },
                  { count: 7, label: '7 Questions', sub: 'Full Loop (30m)' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setTotalQuestions(item.count)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      totalQuestions === item.count
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interview Focus Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Interview Focus Area
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERVIEW_TYPES.map((it) => (
                <div
                  key={it.type}
                  onClick={() => setInterviewType(it.type)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    interviewType === it.type
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900">
                      {it.label}
                    </span>
                    {interviewType === it.type && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Accordion: Job Description / Resume */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Optional: Paste Job Description or Resume for Precision Tailoring
              </span>
              <span className="text-indigo-600">
                {showAdvanced ? 'Hide' : '+ Add context'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 space-y-4 bg-white border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Job Description Snippet or Key Responsibilities
                  </label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description requirements, responsibilities, or tech stack..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Background / Highlights (Resume bullet points)
                  </label>
                  <textarea
                    rows={2}
                    value={resumeSummary}
                    onChange={(e) => setResumeSummary(e.target.value)}
                    placeholder="e.g. 6 years building distributed React/Node systems, scaled service to 2M DAU, led team of 4 engineers..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !role.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Coach is preparing your opening question...</span>
                </>
              ) : (
                <>
                  <span>Begin Mock Interview with Coach</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
