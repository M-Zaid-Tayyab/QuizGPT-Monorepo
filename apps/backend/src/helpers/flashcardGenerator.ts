import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout
  maxRetries: 2,
});

export interface FlashcardOptions {
  difficulty: string;
  category: string;
  count: number;
  user: {
    age?: number;
    grade?: string;
  };
  sourceMaterial?: string;
  generatedFrom?: string;
}

export interface Flashcard {
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export class FlashcardGenerator {
  static async generateFromText(
    text: string,
    options: FlashcardOptions
  ): Promise<Flashcard[]> {
    const prompt = this.buildFlashcardPrompt(text, options);

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(response);
      return this.validateAndCleanFlashcards(parsed.flashcards || []);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw new Error("Failed to generate flashcards");
    }
  }

  static async generateFromOnboardingContext(
    payload: Record<string, unknown>,
    user: { age?: number; grade?: string }
  ): Promise<Flashcard> {
    const prompt = this.buildOnboardingFlashcardPrompt(payload, user);
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
        temperature: 0.6,
      });
      const response = completion.choices[0].message.content;
      if (!response) throw new Error("No response from AI");
      const parsed = JSON.parse(response);
      const cards = this.validateAndCleanFlashcards(parsed.flashcards || []);
      if (cards.length === 0) {
        return {
          front: "What is active recall?",
          back: "A study technique where you retrieve information from memory instead of just re-reading. It strengthens long-term retention.",
          difficulty: "Medium",
          category: "Study Skills",
          tags: ["study", "memory"],
        };
      }
      return cards[0];
    } catch (error) {
      console.error("Error generating onboarding flashcard:", error);
      return {
        front: "What is active recall?",
        back: "A study technique where you retrieve information from memory instead of just re-reading. It strengthens long-term retention.",
        difficulty: "Medium",
        category: "Study Skills",
        tags: ["study", "memory"],
      };
    }
  }

  private static buildOnboardingFlashcardPrompt(
    payload: Record<string, unknown>,
    user: { age?: number; grade?: string }
  ): string {
    const age = user.age ?? 20;
    const grade = (user.grade as string) || "College";
    const mainGoal = payload.mainGoal || "ace exam";
    const difficultSubjects = payload.difficultSubjects || "general";
    const motivation = payload.motivation || "exam prep";
    const studyChallenges = Array.isArray(payload.studyChallenges)
      ? (payload.studyChallenges as string[]).join(", ")
      : String(payload.studyChallenges || "understanding concepts");

    return `ROLE: You are an expert educational content creator.

TASK: Generate exactly ONE high-quality flashcard for an onboarding preview. The user has not provided study material—create one flashcard that would be useful for a ${age}-year-old ${grade} student with this profile:

- Main goal: ${mainGoal}
- Difficult subjects / focus: ${difficultSubjects}
- Motivation: ${motivation}
- Study challenges: ${studyChallenges}

This preview will be the user's first experience—choose a topic that feels personally relevant so they see the value.

TOPIC SELECTION: If difficult subjects include math, science, history, literature, languages, coding, business, social_studies, or arts, prefer a core concept from one of those. If main goal is ace_exam, prefer an exam-style concept from their difficult subjects. If main goal is build_habit or learn_faster (or similar), consider study skills or general knowledge. Otherwise pick a broadly useful concept.

REQUIREMENTS:
- Front: One concise question or term (max 100 characters).
- Back: Clear answer (max 200 characters).
- difficulty: "Easy" or "Medium" or "Hard"
- category: Short label (e.g. "Biology", "Study Skills")
- tags: 2-3 tags array

RESPONSE (JSON only):
{
  "flashcards": [
    {
      "front": "...",
      "back": "...",
      "difficulty": "Medium",
      "category": "...",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
  }

  static async generateFromQuiz(quiz: any): Promise<Flashcard[]> {
    const flashcards: Flashcard[] = [];

    for (const question of quiz.questions) {
      const flashcard = this.convertQuestionToFlashcard(question, quiz.title);
      if (flashcard) {
        flashcards.push(flashcard);
      }
    }

    return flashcards;
  }

  static async generateDeckMeta(
    text: string,
    options: FlashcardOptions
  ): Promise<{ name: string; description: string }> {
    const { category, count } = options;
    const metaPrompt = `ROLE: You are an expert at analyzing educational content and creating meaningful titles and descriptions.

TASK: Analyze the following study material and generate a concise deck title and a short, relevant description based on the ACTUAL CONTENT.

STUDY MATERIAL (truncate if long):
${text.slice(0, 1200)}

REQUIREMENTS:
- Title: <= 60 characters, specific to the content (no generic words like "Flashcards" unless useful)
- Description: 1 sentence, <= 140 characters, clearly states what the deck covers
- Analyze the content to determine the MAIN TOPIC/SUBJECT, don't just use generic categories

CATEGORY CONTEXT: ${category} (use as hint, but analyze content to determine actual topic)
TARGET CARD COUNT: ${count}

🎯 IMPORTANT: Generate the title by ANALYZING the study material content above, not by copying the category. Extract the actual topic/subject from the content.

RESPONSE (JSON only):
{
  "name": "Specific topic title from content analysis",
  "description": "One sentence describing what this deck covers"
}`;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: metaPrompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response for deck meta");
      }
      const parsed = JSON.parse(response);
      const name = (parsed.name || `${category} Study Set`)
        .toString()
        .slice(0, 60)
        .trim();
      const description = (
        parsed.description || `AI-generated flashcards for ${category}`
      )
        .toString()
        .slice(0, 140)
        .trim();
      return { name, description };
    } catch (error) {
      console.warn("Falling back to default deck meta:", error);
      return {
        name: `${category} Study Set`,
        description: `AI-generated flashcards for ${category}`,
      };
    }
  }

  private static buildFlashcardPrompt(
    text: string,
    options: FlashcardOptions
  ): string {
    const { difficulty, category, count, user } = options;
    const { age, grade } = user;

    return `ROLE: You are an expert educational content creator specializing in creating effective study materials for spaced repetition learning.

TASK: Generate ${count} high-quality flashcards from this study material for a ${
      age ? `${age}-year-old ` : ""
    }student in ${grade} grade.

STUDY MATERIAL:
${text}

TARGET AUDIENCE: ${age ? `${age}-year-old ` : ""}student in ${grade} grade
DIFFICULTY: ${difficulty}
CATEGORY: ${category}
TOTAL FLASHCARDS: ${count}

MINIMUM INFORMATION PRINCIPLE:
- Each flashcard should focus on ONE key concept, term, or idea
- Avoid cramming multiple concepts into a single card
- Make each card independent and self-contained
- Cards should be easy to recall and review

🎯 FLASHCARD GUIDELINES:
- Front: Concise question, term, or concept (max 100 characters)
  * Use clear, direct language
  * Focus on what the student needs to recall
  * Avoid unnecessary words
- Back: Clear, detailed answer with examples (max 200 characters)
  * Provide context and examples when helpful
  * Include memory aids, mnemonics, or connections when relevant
  * Make answers comprehensive but concise
- Focus on KEY CONCEPTS that are commonly tested
- Use EXAM-STYLE language and terminology
- Make each card independent and self-contained
- Vary difficulty within the specified range

📝 QUALITY REQUIREMENTS:
- Questions should test UNDERSTANDING, not just memorization
- Include both factual recall and conceptual understanding
- Use clear, unambiguous language
- Provide context and examples in answers
- Make cards challenging but fair
- Ensure accuracy - all information must be factually correct

🏷️ TAGGING SYSTEM:
- Add 2-3 relevant tags per card
- Use academic subject tags (e.g., "biology", "math", "history")
- Include difficulty tags (e.g., "basic", "intermediate", "advanced")
- Add topic-specific tags when relevant
- Tags help organize and filter cards for study

FEW-SHOT EXAMPLE:

Example Flashcard:
{
  "front": "What is photosynthesis?",
  "back": "The process by which plants convert sunlight into energy, using carbon dioxide and water to produce glucose and oxygen. Essential for life on Earth.",
  "difficulty": "Medium",
  "category": "${category}",
  "tags": ["biology", "plants", "energy", "photosynthesis"]
}

JSON RESPONSE FORMAT:
{
  "flashcards": [
    {
      "front": "Question or term (max 100 chars)",
      "back": "Detailed answer with examples (max 200 chars)",
      "difficulty": "Easy|Medium|Hard",
      "category": "${category}",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

🎯 EXAM SUCCESS MISSION:
Generate ${count} flashcards that will help this student:
1. MASTER key concepts through spaced repetition
2. BUILD strong foundational knowledge
3. PREPARE effectively for exams
4. DEVELOP critical thinking skills
5. ACE their upcoming tests!

Make every flashcard count towards their academic success!`;
  }

  private static convertQuestionToFlashcard(
    question: any,
    category: string
  ): Flashcard | null {
    try {
      let front = question.question;
      let back = "";
      let difficulty = "Medium";

      switch (question.questionType) {
        case "mcq":
          front = question.question;
          back = question.options[question.correctAnswer];
          break;
        case "true_false":
          front = question.question;
          back = question.correctAnswer === 0 ? "True" : "False";
          break;
        case "fill_blank":
          front = question.question.replace(/____/g, "_____");
          back = question.options[0];
          break;
        default:
          return null;
      }

      return {
        front: front.substring(0, 100),
        back: back.substring(0, 200),
        difficulty,
        category,
        tags: this.extractTags(question, category),
      };
    } catch (error) {
      console.error("Error converting question to flashcard:", error);
      return null;
    }
  }

  private static extractTags(question: any, category: string): string[] {
    const tags = [category.toLowerCase()];

    // Add difficulty tag based on question content
    if (question.question.length > 100) {
      tags.push("detailed");
    } else {
      tags.push("basic");
    }

    // Add question type tag
    tags.push(question.questionType);

    return tags;
  }

  private static validateAndCleanFlashcards(flashcards: any[]): Flashcard[] {
    return flashcards
      .filter((card) => card && card.front && card.back)
      .map((card) => ({
        front: card.front.substring(0, 100).trim(),
        back: card.back.substring(0, 200).trim(),
        difficulty: card.difficulty || "Medium",
        category: card.category || "General",
        tags: Array.isArray(card.tags) ? card.tags.slice(0, 3) : [],
      }))
      .filter((card) => card.front.length > 5 && card.back.length > 5);
  }
}
