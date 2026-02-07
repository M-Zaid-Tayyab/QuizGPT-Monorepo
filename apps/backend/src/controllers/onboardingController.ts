import { Response } from "express";
import OpenAI from "openai";
import { FlashcardGenerator } from "../helpers/flashcardGenerator";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Quiz from "../models/quizModel";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
  maxRetries: 2,
});

/** Normalize array fields to strings so prompts get "math, science" not "[object Object]". */
function normalizeOnboardingPayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...payload };
  if (Array.isArray(out.difficultSubjects)) {
    out.difficultSubjects =
      (out.difficultSubjects as string[]).length > 0
        ? (out.difficultSubjects as string[]).join(", ")
        : "general";
  } else if (out.difficultSubjects == null || out.difficultSubjects === "") {
    out.difficultSubjects = "general";
  }
  if (Array.isArray(out.studyChallenges)) {
    out.studyChallenges = (out.studyChallenges as string[]).join(", ");
  }
  return out;
}

function buildOnboardingContext(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  if (payload.mainGoal) parts.push(`Goal: ${payload.mainGoal}`);
  if (payload.difficultSubjects)
    parts.push(`Focus subjects: ${payload.difficultSubjects}`);
  if (payload.motivation) parts.push(`Motivation: ${payload.motivation}`);
  if (payload.studyChallenges) {
    const c = payload.studyChallenges;
    parts.push(
      `Challenges: ${Array.isArray(c) ? (c as string[]).join(", ") : c}`
    );
  }
  if (payload.studyConfidence != null)
    parts.push(`Confidence (1-10): ${payload.studyConfidence}`);
  if (payload.studyFrequency)
    parts.push(`Study frequency: ${payload.studyFrequency}`);
  if (payload.learningStyle) {
    const l = payload.learningStyle;
    parts.push(
      `Learning style: ${Array.isArray(l) ? (l as string[]).join(", ") : l}`
    );
  }
  if (payload.studyMaterials) {
    const m = payload.studyMaterials;
    parts.push(
      `Materials: ${Array.isArray(m) ? (m as string[]).join(", ") : m}`
    );
  }
  return parts.length > 0 ? parts.join(". ") : "General student, any subject.";
}

/** Dedicated prompt for onboarding preview: no study material, only user profile. */
function buildOnboardingQuizPrompt(
  context: string,
  age: number,
  grade: string
): string {
  return `ROLE: You are an expert educational content creator.

TASK: This is an onboarding preview. There is NO study material—only the following user profile. Use this profile to choose ONE topic and generate exactly 1 multiple-choice question (MCQ) that feels relevant to their goal and subjects.

USER PROFILE:
${context}

TOPIC SELECTION RULES:
- mainGoal ace_exam: pick an exam-style concept from one of their difficult subjects (math, science, history, literature, languages, coding, business, social_studies, arts). If no subjects given, use a broadly useful exam concept.
- mainGoal master_subject: pick one core concept from a subject they care about or find difficult.
- mainGoal build_habit or catch_up: pick a study-skills or foundational concept (e.g. active recall, spaced repetition) or a single general-knowledge concept that feels useful.
- difficultSubjects: if the profile lists subjects (e.g. math, science), prefer a concept from one of those. Otherwise pick a broadly useful concept.

This will be the user's first experience of the product—make the question clearly relevant to their profile so they see the value.

TARGET: ${age}-year-old ${grade} student. Use clear, age-appropriate language. One question only.

RESPONSE FORMAT (JSON only):
{
  "title": "Short quiz title (max 60 chars, reflect the topic)",
  "questions": [
    {
      "question": "Question text?",
      "questionType": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Generate exactly 1 MCQ. correctAnswer must be the index (0-3) of the correct option.`;
}

export const generateOnboardingPreview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const rawPayload = (req.body || {}) as Record<string, unknown>;
    const payload = normalizeOnboardingPayload(rawPayload);
    const context = buildOnboardingContext(payload);
    const age = (user as any).age ?? 20;
    const grade = (user as any).grade || "College";

    const onboardingQuizPrompt = buildOnboardingQuizPrompt(context, age, grade);

    const [completion, flashcard] = await Promise.all([
      openai.chat.completions.create({
        messages: [{ role: "user", content: onboardingQuizPrompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
      FlashcardGenerator.generateFromOnboardingContext(payload, {
        age,
        grade,
      }),
    ]);

    if (!completion.choices[0].message.content) {
      throw new Error("No content received from OpenAI");
    }

    const response = JSON.parse(completion.choices[0].message.content);
    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    const quiz = await Quiz.create({
      description: `Onboarding preview: ${context}`,
      title: response.title || "Quick Preview Quiz",
      questions: response.questions,
      createdBy: userId,
    });

    res.status(201).json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
      },
      flashcard: {
        front: flashcard.front,
        back: flashcard.back,
        difficulty: flashcard.difficulty,
        category: flashcard.category,
        tags: flashcard.tags || [],
      },
    });
  } catch (error) {
    console.error("Error generating onboarding preview:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error generating preview",
    });
  }
};
