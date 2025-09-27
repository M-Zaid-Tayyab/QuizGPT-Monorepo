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
      return {
        topic: req.body.topic,
        difficulty: req.body.difficulty,
        questionTypes: JSON.parse(req.body.questionTypes),
        numberOfQuestions: parseInt(req.body.numberOfQuestions, 10),
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
