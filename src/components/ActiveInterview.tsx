import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { InterviewTurn, RoleSetup, EvaluationResult } from '../types';
import { AnswerEvaluationCard } from './AnswerEvaluationCard';
import { createSpeechRecognizer, SpeechRecognizerWrapper } from '../utils/speech';

interface ActiveInterviewProps {
  currentTurn: InterviewTurn;
  questionIndex: number;
  totalQuestions: number;
  roleSetup: RoleSetup;
  coachGreeting?: string;
  isEvaluating: boolean;
  onEvaluateAnswer: (answer: string, durationSeconds: number) => Promise<void>;
  onProceedToNext: () => void;
  onRetryQuestion: () => void;
  onFinishInterview: () => void;
  onPlayCoachVoice: (text: string) => void;
  isAudioPlaying: boolean;
  voiceEnabled: boolean;
}

export const ActiveInterview: React.FC<ActiveInterviewProps> = ({
  currentTurn,
  questionIndex,
  totalQuestions,
  roleSetup,
  coachGreeting,
  isEvaluating,
  onEvaluateAnswer,
  onProceedToNext,
  onRetryQuestion,
  onFinishInterview,
  onPlayCoachVoice,
  isAudioPlaying,
  voiceEnabled,
}) => {
  const [answerText, setAnswerText] = useState(currentTurn.userAnswer || '');
  const [showTip, setShowTip] = useState(false);
  const [showStarGuide, setShowStarGuide] = useState(false);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const timerIntervalRef = useRef<any>(null);

  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognizerRef = useRef<SpeechRecognizerWrapper | null>(null);

  // Word count and speaking time
  const words = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const estimatedSpeakingMinutes = (words / 130).toFixed(1);

  // Initialize Speech Recognizer
  useEffect(() => {
    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setAnswerText((prev) => {
          if (prev.endsWith(' ') || prev === '') {
            return prev + transcript;
          }
          return prev + ' ' + transcript;
        });
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    setMicSupported(recognizer.isSupported);
    recognizerRef.current = recognizer;

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (!currentTurn.evaluation && timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentTurn.evaluation, timerRunning]);

  // Reset answer text and timer if new question is loaded
  useEffect(() => {
    setAnswerText(currentTurn.userAnswer || '');
    setTimerSeconds(0);
    setTimerRunning(true);
    setShowTip(false);
  }, [currentTurn.id]);

  const toggleMic = () => {
    if (!micSupported || !recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      recognizerRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isEvaluating) return;

    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
    setTimerRunning(false);

    await onEvaluateAnswer(answerText.trim(), timerSeconds);
  };

  const insertStarTemplate = () => {
    const template = `Situation: 
Task: 
Action: 
Result: `;
    setAnswerText((prev) => (prev ? prev + '\n\n' + template : template));
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isEvaluated = !!currentTurn.evaluation;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>
              Question {questionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {currentTurn.questionCategory}
          </span>
        </div>

        <button
          onClick={onFinishInterview}
          className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4"
        >
          Conclude Session
        </button>
      </div>

      {/* Progress Dots */}
      <div className="w-full grid grid-cols-5 gap-1.5 h-1.5 rounded-full overflow-hidden">
        {Array.from({ length: totalQuestions }).map((_, idx) => (
          <div
            key={idx}
            className={`h-full rounded-full transition-colors ${
              idx < questionIndex
                ? 'bg-emerald-500'
                : idx === questionIndex
                ? 'bg-indigo-600'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Coach Greeting (if question 1 and greeting provided) */}
      {questionIndex === 0 && coachGreeting && !isEvaluated && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
            AI
          </div>
          <div className="text-xs text-indigo-950 leading-relaxed">
            <span className="font-bold block text-indigo-900 mb-0.5">
              Coach Kore:
            </span>
            {coachGreeting}
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Target Focus: {currentTurn.questionCategory}
          </span>

          <button
            onClick={() => onPlayCoachVoice(currentTurn.question)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isAudioPlaying
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isAudioPlaying ? 'Speaking...' : 'Hear Question'}</span>
          </button>
        </div>

        {/* The Question Text */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {currentTurn.question}
        </h2>

        {/* Expandable Coach Tip */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowTip(!showTip)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {showTip
                ? 'Hide Interviewer Evaluation Criteria'
                : 'Coach Tip: What hiring managers look for in this question'}
            </span>
            {showTip ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTip && (
            <div className="mt-2 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 leading-relaxed animate-in fade-in">
              <span className="font-semibold block mb-1">Interviewer Rubric:</span>
              {currentTurn.coachTip}
            </div>
          )}
        </div>
      </div>

      {/* Answer Area OR Evaluation Result */}
      {!isEvaluated ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Your Answer (Question {questionIndex + 1} of {totalQuestions})
              </h3>
              <p className="text-xs text-slate-500">
                Speak aloud using your mic or type your response below.
              </p>
            </div>

            {/* Pacing Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className={`font-semibold ${timerSeconds > 150 ? 'text-amber-600' : 'text-slate-700'}`}>
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                (target: 1:30 - 2:30)
              </span>
            </div>
          </div>

          {/* STAR Framework Helper Pill & Quick Insert */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowStarGuide(!showStarGuide)}
              className="text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-medium"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{showStarGuide ? 'Hide STAR Guide' : 'Need help structuring? View STAR Method'}</span>
            </button>

            <button
              type="button"
              onClick={insertStarTemplate}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors border border-indigo-200"
            >
              + Insert STAR Template
            </button>
          </div>

          {showStarGuide && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 space-y-2">
              <div className="font-bold text-amber-900">The STAR Method for High-Impact Answers:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded bg-white/70 border border-amber-100">
                  <strong className="text-amber-950">S - Situation:</strong> Set the scene, context, and challenge faced.
                </div>
                <div className="p-2 rounded bg-white/70 border border-amber-100">
                  <strong className="text-amber-950">T - Task:</strong> Your specific responsibility and measurable objective.
                </div>
                <div className="p-2 rounded bg-white/70 border border-amber-100">
                  <strong className="text-amber-950">A - Action:</strong> Concrete actions and leadership YOU took (use "I", not just "we").
                </div>
                <div className="p-2 rounded bg-white/70 border border-amber-100">
                  <strong className="text-amber-950">R - Result:</strong> The quantifiable outcome, ROI, and lessons learned.
                </div>
              </div>
            </div>
          )}

          {/* Answer Form */}
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div className="relative">
              <textarea
                rows={7}
                required
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Structure your answer clearly. Provide the context, your specific contributions, and the measurable results achieved..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 bg-white"
              />

              {/* Live recording indicator banner */}
              {isListening && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold shadow-md animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Listening... Speak now</span>
                </div>
              )}
            </div>

            {/* Metrics and Controls Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{words} words</span>
                <span>•</span>
                <span>~{estimatedSpeakingMinutes} min spoken</span>
                {answerText && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setAnswerText('')}
                      className="text-slate-400 hover:text-slate-600 underline"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Speech to text toggle */}
                {micSupported && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      isListening
                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400 animate-pulse'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    title={isListening ? 'Stop microphone' : 'Speak your answer using voice recognition'}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 text-rose-600" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-indigo-600" />
                        <span>Speak Answer</span>
                      </>
                    )}
                  </button>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isEvaluating || !answerText.trim()}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Evaluation</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Evaluation Card */
        <AnswerEvaluationCard
          evaluation={currentTurn.evaluation!}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestions}
          isLastQuestion={questionIndex + 1 >= totalQuestions}
          nextQuestion={currentTurn.transitionRationale ? currentTurn.question : undefined}
          nextQuestionCategory={currentTurn.questionCategory}
          transitionRationale={currentTurn.transitionRationale}
          onProceed={onProceedToNext}
          onRetry={onRetryQuestion}
          onFinishEarly={onFinishInterview}
          onPlayFeedbackAudio={onPlayCoachVoice}
          isAudioPlaying={isAudioPlaying}
        />
      )}
    </div>
  );
};
