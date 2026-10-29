import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InterviewSetup } from './components/InterviewSetup';
import { ActiveInterview } from './components/ActiveInterview';
import { ReadinessScorecard } from './components/ReadinessScorecard';
import { RoleSetup, InterviewTurn, ReadinessReport } from './types';
import { playCoachVoice, stopCoachVoice } from './utils/speech';

export default function App() {
  const [sessionState, setSessionState] = useState<'setup' | 'active' | 'scorecard'>('setup');
  const [roleSetup, setRoleSetup] = useState<RoleSetup | null>(null);
  const [coachGreeting, setCoachGreeting] = useState<string>('');
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingScorecard, setIsGeneratingScorecard] = useState(false);
  const [readinessReport, setReadinessReport] = useState<ReadinessReport | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Play Coach Voice handler
  const handlePlayCoachVoice = async (text: string) => {
    if (!voiceEnabled) return;
    setIsAudioPlaying(true);
    await playCoachVoice(text, () => {
      setIsAudioPlaying(false);
    });
  };

  const handleToggleVoice = () => {
    if (voiceEnabled) {
      stopCoachVoice();
      setIsAudioPlaying(false);
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
    }
  };

  // 1. Start Interview Session
  const handleStartInterview = async (setup: RoleSetup) => {
    setIsStarting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setup),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const data = await res.json();

      const firstTurn: InterviewTurn = {
        id: 'turn-1',
        questionNumber: 1,
        question: data.firstQuestion,
        questionCategory: data.questionCategory,
        coachTip: data.coachTip,
        recommendedDurationSeconds: data.recommendedDurationSeconds || 120,
      };

      setRoleSetup(setup);
      setCoachGreeting(data.coachGreeting);
      setTurns([firstTurn]);
      setCurrentTurnIndex(0);
      setSessionState('active');

      // Auto play coach question if voice enabled
      if (voiceEnabled) {
        const announcement = `${data.coachGreeting}. Let's start with your first question: ${data.firstQuestion}`;
        handlePlayCoachVoice(announcement);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to connect to the interview coach. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  // 2. Evaluate Answer and receive next question
  const handleEvaluateAnswer = async (answer: string, durationSeconds: number) => {
    if (!roleSetup) return;
    setIsEvaluating(true);
    setErrorMessage(null);

    const currentTurn = turns[currentTurnIndex];

    try {
      const res = await fetch('/api/interview/evaluate-and-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleInfo: roleSetup,
          currentQuestion: currentTurn.question,
          userAnswer: answer,
          questionNumber: currentTurnIndex + 1,
          totalQuestions: roleSetup.totalQuestions,
          previousTurns: turns.slice(0, currentTurnIndex),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to evaluate answer');
      }

      const data = await res.json();

      // Update current turn with answer and evaluation
      const updatedTurn: InterviewTurn = {
        ...currentTurn,
        userAnswer: answer,
        answerDurationSeconds: durationSeconds,
        evaluation: data.evaluation,
        transitionRationale: data.transitionRationale,
      };

      const updatedTurns = [...turns];
      updatedTurns[currentTurnIndex] = updatedTurn;

      // If there is a next question, prepare it
      if (!data.isFinalQuestion && data.nextQuestion && currentTurnIndex + 1 < roleSetup.totalQuestions) {
        const nextTurn: InterviewTurn = {
          id: `turn-${currentTurnIndex + 2}`,
          questionNumber: currentTurnIndex + 2,
          question: data.nextQuestion,
          questionCategory: data.questionCategory || 'Follow-up',
          coachTip: data.coachTip || 'Structure your answer with clear metrics and context.',
          recommendedDurationSeconds: data.recommendedDurationSeconds || 120,
        };
        // Add if not already present
        if (updatedTurns.length <= currentTurnIndex + 1) {
          updatedTurns.push(nextTurn);
        } else {
          updatedTurns[currentTurnIndex + 1] = nextTurn;
        }
      }

      setTurns(updatedTurns);

      // Auto play concise feedback
      if (voiceEnabled && data.evaluation) {
        const voiceFeedback = `Score: ${data.evaluation.score} out of 10. ${data.evaluation.coachInsight}`;
        handlePlayCoachVoice(voiceFeedback);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to evaluate your answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // 3. Move to next question or scorecard
  const handleProceedToNext = () => {
    stopCoachVoice();
    setIsAudioPlaying(false);

    if (currentTurnIndex + 1 < turns.length && roleSetup && currentTurnIndex + 1 < roleSetup.totalQuestions) {
      setCurrentTurnIndex((prev) => prev + 1);
      // Read next question if voice enabled
      const nextTurn = turns[currentTurnIndex + 1];
      if (voiceEnabled && nextTurn) {
        handlePlayCoachVoice(nextTurn.question);
      }
    } else {
      // Conclude and build final scorecard
      handleGenerateScorecard();
    }
  };

  // 4. Retry current question
  const handleRetryQuestion = () => {
    stopCoachVoice();
    setIsAudioPlaying(false);
    const updatedTurns = [...turns];
    const current = updatedTurns[currentTurnIndex];
    updatedTurns[currentTurnIndex] = {
      ...current,
      userAnswer: undefined,
      evaluation: undefined,
      transitionRationale: undefined,
    };
    setTurns(updatedTurns);
  };

  // 5. Generate comprehensive final scorecard
  const handleGenerateScorecard = async () => {
    if (!roleSetup) return;
    setIsGeneratingScorecard(true);
    setErrorMessage(null);

    // Filter to only answered turns
    const answeredTurns = turns.filter((t) => !!t.evaluation);

    try {
      const res = await fetch('/api/interview/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleInfo: roleSetup,
          turns: answeredTurns,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const reportData: ReadinessReport = await res.json();
      setReadinessReport(reportData);
      setSessionState('scorecard');

      if (voiceEnabled) {
        const finalVoice = `Interview completed. Your overall readiness score is ${reportData.overallScore.toFixed(1)} out of 10, with a hiring verdict of ${reportData.hiringVerdict}.`;
        handlePlayCoachVoice(finalVoice);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate readiness scorecard');
    } finally {
      setIsGeneratingScorecard(false);
    }
  };

  // 6. Reset session
  const handleResetSession = () => {
    stopCoachVoice();
    setIsAudioPlaying(false);
    setRoleSetup(null);
    setTurns([]);
    setCurrentTurnIndex(0);
    setReadinessReport(null);
    setErrorMessage(null);
    setSessionState('setup');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        roleSetup={roleSetup}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        onResetSession={handleResetSession}
        activeQuestionIndex={currentTurnIndex}
        totalQuestions={roleSetup?.totalQuestions}
      />

      {/* Global Error Alert Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-900 font-bold ml-4 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {sessionState === 'setup' && (
          <InterviewSetup onStart={handleStartInterview} isLoading={isStarting} />
        )}

        {sessionState === 'active' && roleSetup && turns[currentTurnIndex] && (
          <ActiveInterview
            currentTurn={turns[currentTurnIndex]}
            questionIndex={currentTurnIndex}
            totalQuestions={roleSetup.totalQuestions}
            roleSetup={roleSetup}
            coachGreeting={coachGreeting}
            isEvaluating={isEvaluating}
            onEvaluateAnswer={handleEvaluateAnswer}
            onProceedToNext={handleProceedToNext}
            onRetryQuestion={handleRetryQuestion}
            onFinishInterview={handleGenerateScorecard}
            onPlayCoachVoice={handlePlayCoachVoice}
            isAudioPlaying={isAudioPlaying}
            voiceEnabled={voiceEnabled}
          />
        )}

        {sessionState === 'scorecard' && readinessReport && roleSetup && (
          <ReadinessScorecard
            report={readinessReport}
            turns={turns}
            roleSetup={roleSetup}
            onRestart={handleResetSession}
          />
        )}

        {/* Loading overlay for final scorecard generation */}
        {isGeneratingScorecard && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">
                Compiling Executive Scorecard
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coach Kore is synthesizing your performance, analyzing STAR structure, score trends, and formulating your 48-hour interview readiness action plan...
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Ascent AI Career Coach</span> — Professional mock interview simulations, objective feedback, and STAR framework mastery.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8</span>
            <span>•</span>
            <span>Confidential Practice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
