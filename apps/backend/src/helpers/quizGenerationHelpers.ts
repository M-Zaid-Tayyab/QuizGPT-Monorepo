import { AuthenticatedRequest } from "../middleware/authMiddleware";
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
  user: {
    age?: number;
    grade?: string;
  };
  examType?: string;
}

export interface Question {
  question: string;
  questionType: "mcq" | "true_false" | "fill_blank";
  options: string[];
  correctAnswer: number;
}

export class InputProcessor {
  static async extractRequestData(
    req: AuthenticatedRequest
  ): Promise<QuizRequest> {
    if (req.file) {
      // Safely handle optional fields from multipart forms
      const topic = req.body?.topic || "General";
      const difficulty = req.body?.difficulty || "Medium";
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
        difficulty: req.body.difficulty || "Medium",
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
