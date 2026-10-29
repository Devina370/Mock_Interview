import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Start Interview - generates initial greeting and the first tailored question
app.post('/api/interview/start', async (req: Request, res: Response) => {
  try {
    const {
      role,
      industry,
      company,
      seniority,
      interviewType,
      jobDescription,
      resumeSummary,
    } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required to tailor the interview.' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are an elite, top-tier career and executive interview coach with over 15 years of experience coaching candidates into FAANG, high-growth startups, Fortune 500 corporations, and premier consulting firms.
Your goal is to conduct a realistic, high-impact mock interview.

Rules:
1. Ask exactly ONE interview question to start.
2. The question must be deeply tailored to the candidate's target role (${role}), industry (${industry || 'General Tech/Business'}), seniority level (${seniority || 'Mid-Senior'}), company type (${company || 'Industry standard'}), and interview focus (${interviewType || 'General & Behavioral'}).
3. Tone: Encouraging, professional, insightful, and executive.
4. Provide a warm, concise opening welcome (2-3 sentences), followed by the first targeted question, its evaluation category, and a brief coaching tip explaining what hiring managers look for in this opening question.`;

    const prompt = `Target Role: ${role}
Industry: ${industry || 'Not specified'}
Target Company: ${company || 'Standard industry practice'}
Seniority: ${seniority || 'Mid-Senior'}
Interview Focus: ${interviewType || 'Comprehensive Mixed'}
${jobDescription ? `Job Description Context: ${jobDescription}` : ''}
${resumeSummary ? `Candidate Background: ${resumeSummary}` : ''}

Generate the welcome opening and the very first interview question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coachGreeting: {
              type: Type.STRING,
              description: 'Warm, professional greeting setting up the mock interview expectations.',
            },
            firstQuestion: {
              type: Type.STRING,
              description: 'The exact first interview question tailored to the role.',
            },
            questionCategory: {
              type: Type.STRING,
              description: 'Category such as "Background & Value Proposition", "Behavioral / Leadership", "Technical Architecture", etc.',
            },
            coachTip: {
              type: Type.STRING,
              description: 'A helpful coach tip on what the interviewer evaluates in this question.',
            },
            recommendedDurationSeconds: {
              type: Type.INTEGER,
              description: 'Recommended answer time in seconds, usually 90 to 150 seconds.',
            },
          },
          required: ['coachGreeting', 'firstQuestion', 'questionCategory', 'coachTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error starting interview:', error);
    return res.status(500).json({
      error: error.message || 'Failed to start mock interview',
    });
  }
});

// 2. Evaluate answer and formulate next logical question
app.post('/api/interview/evaluate-and-next', async (req: Request, res: Response) => {
  try {
    const {
      roleInfo,
      currentQuestion,
      userAnswer,
      questionNumber,
      totalQuestions = 5,
      previousTurns = [],
    } = req.body;

    if (!userAnswer || !userAnswer.trim()) {
      return res.status(400).json({ error: 'User answer is required for evaluation.' });
    }

    const ai = getGeminiClient();

    const isLast = questionNumber >= totalQuestions;

    const systemInstruction = `You are an expert, professional career and interview coach conducting a rigorous mock interview.
Follow these rules strictly:
1. Evaluate the candidate's response objectively against premier hiring standards.
2. Provide a realistic score out of 10.0 (e.g. 7.5, 8.2, 9.0; be fair, honest, and constructive; avoid giving 10/10 easily unless truly exceptional).
3. Provide a score breakdown across:
   - Content & Relevance (out of 10)
   - Structure & Clarity (out of 10, evaluating STAR method adherence if applicable)
   - Impact & Quantifiable Results (out of 10)
   - Executive Tone & Delivery (out of 10)
4. Highlight what they did well (specific strengths, positive phrasing, demonstrated traits).
5. Give constructive, specific suggestions for improvement (actionable critique, what was missing, how to elevate metrics, how to structure better).
6. Provide an upgraded "Model Answer Snippet" or rewrite demonstrating how a top 1% candidate answers this question using the STAR method (Situation, Task, Action, Result) or crisp executive summary.
7. Next Question:
   - If this is question ${questionNumber} of ${totalQuestions} and it's NOT the last question: Ask ONE next logical interview question.
   - The next question MUST logically build upon the interview so far (e.g., following up on a topic mentioned, diving into technical depth, exploring conflict resolution, or testing leadership/prioritization).
   - Provide a transition rationale explaining why this is the next logical question.
   - If it is the final question, mark isFinalQuestion: true and provide a concluding sentence.
8. Maintain an encouraging, professional, and insightful tone throughout.`;

    const contextPayload = {
      roleInfo,
      questionNumber,
      totalExpectedQuestions: totalQuestions,
      currentQuestion,
      candidateAnswer: userAnswer,
      interviewHistorySummary: previousTurns.map((turn: any, index: number) => ({
        qNum: index + 1,
        question: turn.question,
        score: turn.evaluation?.score,
        topic: turn.questionCategory,
      })),
    };

    const prompt = JSON.stringify(contextPayload);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: {
              type: Type.OBJECT,
              properties: {
                score: {
                  type: Type.NUMBER,
                  description: 'Overall score out of 10 for this answer (e.g. 7.8)',
                },
                scoreBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    contentAndRelevance: { type: Type.NUMBER },
                    structureAndClarity: { type: Type.NUMBER },
                    impactAndMetrics: { type: Type.NUMBER },
                    executiveTone: { type: Type.NUMBER },
                  },
                  required: ['contentAndRelevance', 'structureAndClarity', 'impactAndMetrics', 'executiveTone'],
                },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 4 specific things the candidate did well.',
                },
                improvementSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 4 constructive, specific suggestions for improvement.',
                },
                coachInsight: {
                  type: Type.STRING,
                  description: 'A thoughtful paragraph explaining how hiring managers perceive this response.',
                },
                modelAnswerSnippet: {
                  type: Type.STRING,
                  description: 'A polished, top-tier example of how to frame or answer this question.',
                },
              },
              required: ['score', 'scoreBreakdown', 'strengths', 'improvementSuggestions', 'coachInsight', 'modelAnswerSnippet'],
            },
            isFinalQuestion: {
              type: Type.BOOLEAN,
              description: 'True if this was the last question in the mock session.',
            },
            nextQuestion: {
              type: Type.STRING,
              description: 'The next logical interview question (empty if final).',
            },
            transitionRationale: {
              type: Type.STRING,
              description: 'Coach commentary bridging the previous answer to the new question.',
            },
            questionCategory: {
              type: Type.STRING,
              description: 'Category for the new question (e.g. "Cross-functional Collaboration", "System Scalability").',
            },
            coachTip: {
              type: Type.STRING,
              description: 'Advice for the upcoming question.',
            },
            recommendedDurationSeconds: {
              type: Type.INTEGER,
              description: 'Recommended answer time in seconds.',
            },
          },
          required: ['evaluation', 'isFinalQuestion', 'nextQuestion', 'transitionRationale', 'questionCategory', 'coachTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({
      error: error.message || 'Failed to evaluate answer',
    });
  }
});

// 3. Interview Summary & Readiness Scorecard
app.post('/api/interview/summary', async (req: Request, res: Response) => {
  try {
    const { roleInfo, turns } = req.body;

    if (!turns || turns.length === 0) {
      return res.status(400).json({ error: 'No interview turns to evaluate.' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a Principal Career & Interview Coach creating a comprehensive Final Mock Interview Readiness Scorecard.
Analyze all answered questions, scores, strengths, and areas for improvement.
Generate a realistic, empowering, and actionable debrief for the candidate.`;

    const prompt = JSON.stringify({
      targetRole: roleInfo,
      interviewTurns: turns,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.NUMBER,
              description: 'Weighted overall score out of 10 across the entire interview session.',
            },
            hiringVerdict: {
              type: Type.STRING,
              description: '"Strong Hire", "Hire", "Leaning Hire", or "Needs Practice"',
            },
            executiveSummary: {
              type: Type.STRING,
              description: 'A comprehensive 2-3 paragraph coaching debrief summarizing performance, readiness, and trajectory.',
            },
            topStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key overarching competitive advantages demonstrated.',
            },
            primaryGrowthAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Priority areas to refine before the real interview.',
            },
            starMethodMastery: {
              type: Type.OBJECT,
              properties: {
                rating: { type: Type.STRING, description: 'e.g. "Proficient", "Advanced", "Developing"' },
                critique: { type: Type.STRING, description: 'Feedback specifically on Situation, Task, Action, Result framing' },
              },
              required: ['rating', 'critique'],
            },
            tailoredActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 concrete action items for the next 48 hours.',
            },
          },
          required: [
            'overallScore',
            'hiringVerdict',
            'executiveSummary',
            'topStrengths',
            'primaryGrowthAreas',
            'starMethodMastery',
            'tailoredActionPlan',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate interview summary',
    });
  }
});

// 4. Coach Text-to-Speech (TTS) via gemini-3.8-flash-lite-tts
app.post('/api/interview/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Limit text length to avoid excessive latency on long passages (first 400 chars)
    const cleanText = text.slice(0, 500);

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, encouraging, executive interview coach',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.json({ audio: null, fallbackToBrowser: true });
    }

    return res.json({ audio: base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    // If TTS fails (e.g., quota or temporary service), return fallback flag smoothly
    return res.json({ audio: null, fallbackToBrowser: true, message: error.message });
  }
});

// Setup Vite or static serving
async function bootstrapServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Ascent AI Coach Server running on http://0.0.0.0:${port}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
