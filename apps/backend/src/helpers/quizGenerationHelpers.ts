import { AnonymousAuthRequest } from "../middleware/anonymousAuthMiddleware";
import {
  extractTextFromImage,
  extractTextFromPDF,
  validateFileType,
} from "./textExtractionHelper";

export interface QuizRequest {
  topic: string;
  difficulty: string;
  questionTypes: string[];
  numberOfQuestions: number;
  file?: any;
}

export interface QuizOptions {
  difficulty: string;
  questionTypes: string[];
  numberOfQuestions: number;
  user: any;
}

export interface Question {
  question: string;
  questionType: "mcq" | "true_false" | "fill_blank";
  options: string[];
  correctAnswer: number;
}

export class InputProcessor {
  static async extractRequestData(
    req: AnonymousAuthRequest
  ): Promise<QuizRequest> {
    if (req.file) {
      // Safely handle optional fields from multipart forms
      const topic = req.body?.topic || "General";
      const difficulty =
        req.body?.difficulty || req.anonymousUser?.difficulty || "Medium";
      let questionTypes: string[] = ["mcq", "true_false", "fill_blank"];
      const rawQuestionTypes = req.body?.questionTypes;
      if (rawQuestionTypes) {
        try {
          const parsed =
            typeof rawQuestionTypes === "string"
              ? JSON.parse(rawQuestionTypes)
              : rawQuestionTypes;
          if (Array.isArray(parsed) && parsed.length > 0) {
            questionTypes = parsed as string[];
          }
        } catch {
          // ignore and keep defaults
        }
      }

      let numberOfQuestions = 10;
      const rawNum = req.body?.numberOfQuestions;
      const parsedNum = parseInt(rawNum, 10);
      if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 50) {
        numberOfQuestions = parsedNum;
      }

      return {
        topic,
        difficulty,
        questionTypes,
        numberOfQuestions,
        file: req.file,
      };
    } else {
      return {
        topic: req.body.topic || (req.query.prompt as string),
        difficulty: req.body.difficulty || req.anonymousUser.difficulty,
        questionTypes: req.body.questionTypes || [
          "mcq",
          "true_false",
          "fill_blank",
        ],
        numberOfQuestions: req.body.numberOfQuestions || 10,
      };
    }
  }

  static async processInput(topic: string, file?: any): Promise<string> {
    if (file) {
      const fileType = validateFileType(file.mimetype);

      if (fileType === "invalid") {
        throw new Error(
          "Invalid file type. Only PDF and image files are allowed."
        );
      }

      let fileText: string;
      if (fileType === "pdf") {
        fileText = await extractTextFromPDF(file.buffer);
      } else {
        fileText = await extractTextFromImage(file.buffer);
      }

      if (!fileText || fileText.trim().length === 0) {
        throw new Error(
          "No text could be extracted from the uploaded file. Please try a different file or use a text prompt."
        );
      }

      if (fileText.length > 2000) {
        fileText = fileText.substring(0, 2000) + "...";
      }

      return `Topic: ${topic}\n\nStudy Material:\n${fileText}`;
    }

    return topic;
  }
}

export class QuestionDistributor {
  static distributeQuestions(
    total: number,
    types: string[]
  ): Record<string, number> {
    const base = Math.floor(total / types.length);
    const remainder = total % types.length;

    const distribution: Record<string, number> = {};
    types.forEach((type, index) => {
      distribution[type] = base + (index < remainder ? 1 : 0);
    });

    return distribution;
  }
}

export class QuestionValidator {
  static validateAndCleanQuestions(questions: any[]): Question[] {
    return questions.map((q, index) => {
      const cleaned = this.cleanQuestion(q);
      this.validateQuestion(cleaned, index);
      return cleaned;
    });
  }

  private static cleanQuestion(q: any): Question {
    let questionType = q.questionType;
    if (q.questionType === "true/false") {
      questionType = "true_false";
    } else if (q.questionType === "fill-in-the-blank") {
      questionType = "fill_blank";
    }

    let correctAnswer = q.correctAnswer;
    if (typeof q.correctAnswer === "string") {
      const parsed = parseInt(q.correctAnswer);
      correctAnswer = isNaN(parsed) ? 0 : parsed;
    } else if (typeof q.correctAnswer === "boolean") {
      correctAnswer = q.correctAnswer ? 0 : 1;
    }

    if (questionType === "true_false") {
      return {
        question: q.question || "True or False question",
        questionType: "true_false",
        options: ["True", "False"],
        correctAnswer:
          correctAnswer >= 0 && correctAnswer <= 1 ? correctAnswer : 0,
      };
    } else if (questionType === "fill_blank") {
      let questionText = q.question || "Fill in the blank question";
      let correctAnswerText = "";

      if (
        !questionText.includes("____") &&
        !questionText.includes("___") &&
        !questionText.includes("__")
      ) {
        questionText = questionText.replace(/[.!?]$/, " ____.");
        if (!questionText.includes("____")) {
          questionText += " ____";
        }
      }

      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        correctAnswerText = q.options[0];
      } else if (typeof q.correctAnswer === "string") {
        correctAnswerText = q.correctAnswer;
      } else if (typeof q.correctAnswer === "number") {
        correctAnswerText = q.correctAnswer.toString();
      }

      return {
        question: questionText,
        questionType: "fill_blank",
        options: [correctAnswerText || "Answer"],
        correctAnswer: 0,
      };
    } else if (questionType === "mcq") {
      const options =
        q.options && Array.isArray(q.options) && q.options.length >= 2
          ? q.options
          : ["Option A", "Option B", "Option C", "Option D"];

      return {
        question: q.question || "Multiple choice question",
        questionType: "mcq",
        options: options,
        correctAnswer:
          correctAnswer >= 0 && correctAnswer < options.length
            ? correctAnswer
            : 0,
      };
    }

    return {
      question: q.question || "Question",
      questionType: questionType as any,
      options:
        q.options && Array.isArray(q.options)
          ? q.options
          : ["Option A", "Option B"],
      correctAnswer: correctAnswer,
    };
  }

  private static validateQuestion(q: Question, index: number): void {
    if (!q.question || typeof q.question !== "string") {
      throw new Error(`Question ${index}: Missing or invalid question text`);
    }

    if (
      !q.questionType ||
      !["mcq", "true_false", "fill_blank"].includes(q.questionType)
    ) {
      throw new Error(
        `Question ${index}: Invalid questionType: ${q.questionType}`
      );
    }

    if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
      throw new Error(`Question ${index}: Missing or invalid options`);
    }

    if (
      typeof q.correctAnswer !== "number" ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length
    ) {
      throw new Error(
        `Question ${index}: Invalid correctAnswer: ${q.correctAnswer} (options length: ${q.options.length})`
      );
    }

    if (q.questionType === "fill_blank") {
      const hasBlank =
        q.question.includes("____") ||
        q.question.includes("___") ||
        q.question.includes("__") ||
        q.question.includes("_");

      if (!hasBlank) {
        throw new Error(
          `Question ${index}: Fill-in-the-blank question must contain a blank (____)`
        );
      }

      if (q.options.length !== 1) {
        throw new Error(
          `Question ${index}: Fill-in-the-blank question must have exactly 1 option (the correct answer)`
        );
      }
    }

    if (
      q.questionType === "true_false" &&
      (!q.options.includes("True") || !q.options.includes("False"))
    ) {
      throw new Error(`Question ${index}: Invalid true_false format`);
    }
  }
}

export class ContinueLearningHelper {
  static extractQuizContext(
    quiz: any,
    user: any
  ): {
    description: string;
    difficulty: string;
    questionTypes: string[];
    userContext: any;
  } {
    const questionTypes = [
      ...new Set(quiz.questions.map((q: any) => q.questionType)),
    ] as string[];

    const difficulty = user.difficulty || "medium";

    return {
      description: quiz.description,
      difficulty,
      questionTypes,
      userContext: user,
    };
  }

  static buildContinueLearningPrompt(
    originalDescription: string,
    userPrompt: string,
    existingQuestions: string[],
    context: {
      difficulty: string;
      questionTypes: string[];
      user: any;
    }
  ): string {
    const { difficulty, questionTypes, user } = context;
    const { age, grade, gender } = user;

    const distribution = this.calculateQuestionDistribution(5, questionTypes);
    const distributionText = this.formatQuestionDistribution(distribution);

    return `Continue the exam preparation quiz about "${originalDescription}" based on the user's specific request: "${userPrompt}"

🎯 CONTINUE LEARNING CONTEXT:
- Original Topic: ${originalDescription}
- User Request: ${userPrompt}
- Difficulty Level: ${difficulty.toUpperCase()}
- Target Audience: ${age}-year-old ${gender} in ${grade} grade
- Question Types: ${questionTypes.join(", ").toUpperCase()}
- New Questions Needed: 5

📚 QUESTION DISTRIBUTION FOR NEW QUESTIONS:
${distributionText}

🎓 CONTINUE LEARNING STRATEGY:
- Generate questions that build upon the existing knowledge
- Focus on the specific aspect the user requested
- Maintain the same difficulty level and academic rigor
- Create questions that complement the existing ones
- Ensure questions are completely different from existing ones
- Use the same exam-focused approach as the original quiz

📝 EXISTING QUESTIONS (DO NOT DUPLICATE):
${existingQuestions.map((q, index) => `${index + 1}. ${q}`).join("\n")}

🚫 CRITICAL REQUIREMENTS:
- Generate EXACTLY 5 new questions
- Use ONLY the question types listed in the distribution above
- DO NOT repeat any existing questions
- Maintain the same academic level and difficulty
- Focus on the user's specific request: "${userPrompt}"

📋 RESPONSE FORMAT:
Please respond with a valid JSON object containing the quiz questions.

Return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "questionType": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

🎯 EXAM SUCCESS MISSION:
Generate 5 questions that will help this student:
1. ADDRESS their specific learning request
2. BUILD upon their existing knowledge
3. PRACTICE under the same exam conditions
4. MASTER additional aspects of the topic
5. ACE their upcoming test!

Make every new question count towards their exam success!`;
  }

  private static calculateQuestionDistribution(
    total: number,
    types: string[]
  ): Record<string, number> {
    const base = Math.floor(total / types.length);
    const remainder = total % types.length;

    const distribution: Record<string, number> = {};
    types.forEach((type, index) => {
      distribution[type] = base + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  private static formatQuestionDistribution(
    distribution: Record<string, number>
  ): string {
    return Object.entries(distribution)
      .map(([type, count]) => `- ${count} ${this.getQuestionTypeLabel(type)}`)
      .join("\n");
  }

  private static getQuestionTypeLabel(type: string): string {
    switch (type) {
      case "mcq":
        return "Multiple Choice Questions (4 options each)";
      case "true_false":
        return "True/False Questions";
      case "fill_blank":
        return "Fill-in-the-blank Questions";
      default:
        return `${type} Questions`;
    }
  }
}

export class QuizErrorHandler {
  static handleError(error: any, res: any): void {
    console.error("Quiz generation error:", error);

    if (error.message.includes("Invalid file type")) {
      res.status(400).json({ message: error.message });
    } else if (error.message.includes("No text could be extracted")) {
      res.status(400).json({ message: error.message });
    } else if (error.message.includes("validation failed")) {
      res
        .status(400)
        .json({ message: "Quiz validation failed. Please try again." });
    } else {
      res.status(500).json({ message: "Error generating quiz" });
    }
  }
}
