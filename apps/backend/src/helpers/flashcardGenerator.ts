import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FlashcardOptions {
  difficulty: string;
  category: string;
  count: number;
  user: any;
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
    const metaPrompt = `Analyze the following study material and generate a concise deck title and a short, relevant description based on the ACTUAL CONTENT.

REQUIREMENTS:
- Title: <= 60 characters, specific to the content (no generic words like "Flashcards" unless useful)
- Description: 1 sentence, <= 140 characters, clearly states what the deck covers
- Analyze the content to determine the MAIN TOPIC/SUBJECT, don't just use generic categories

CATEGORY CONTEXT: ${category} (use as hint, but analyze content to determine actual topic)
TARGET CARD COUNT: ${count}

STUDY MATERIAL (truncate if long):\n${text.slice(0, 1200)}

🎯 IMPORTANT: Generate the title by ANALYZING the study material content above, not by copying the category. Extract the actual topic/subject from the content.

Return strict JSON with keys: {"name": string, "description": string}`;

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
    const { age, grade, gender } = user;

    return `Generate ${count} high-quality flashcards from this study material for a ${age}-year-old ${gender} in ${grade} grade.

STUDY MATERIAL:
${text}

TARGET AUDIENCE: ${age}-year-old ${gender} in ${grade} grade
DIFFICULTY: ${difficulty}
CATEGORY: ${category}
TOTAL FLASHCARDS: ${count}

Please respond with a valid JSON object containing the flashcards.

🎯 FLASHCARD GUIDELINES:
- Front: Concise question, term, or concept (max 100 characters)
- Back: Clear, detailed answer with examples (max 200 characters)
- Focus on KEY CONCEPTS that are commonly tested
- Use EXAM-STYLE language and terminology
- Include memory aids, mnemonics, or examples when helpful
- Make each card independent and self-contained
- Vary difficulty within the specified range

📝 QUALITY REQUIREMENTS:
- Questions should test UNDERSTANDING, not just memorization
- Include both factual recall and conceptual understanding
- Use clear, unambiguous language
- Provide context and examples in answers
- Make cards challenging but fair

🏷️ TAGGING SYSTEM:
- Add 2-3 relevant tags per card
- Use academic subject tags (e.g., "biology", "math", "history")
- Include difficulty tags (e.g., "basic", "intermediate", "advanced")
- Add topic-specific tags when relevant

JSON RESPONSE FORMAT:
{
  "flashcards": [
    {
      "front": "What is photosynthesis?",
      "back": "The process by which plants convert sunlight into energy, using carbon dioxide and water to produce glucose and oxygen. Essential for life on Earth.",
      "difficulty": "Medium",
      "tags": ["biology", "plants", "energy", "photosynthesis"]
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
