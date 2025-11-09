import dotenv from "dotenv";
import { Response } from "express";
import OpenAI from "openai";
import { PromptBuilder } from "../helpers/promptBuilder";
import {
  extractTextFromImage,
  extractTextFromPDF,
  validateFileType,
} from "../helpers/textExtractionHelper";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Quiz from "../models/quizModel";
import User from "../models/userModel";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionAnswer {
  questionIndex: number;
  selectedAnswer: number;
  userTextAnswer?: string;
}

export const generateCustomQuiz = async (
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
    const { age, grade } = user;

    let userInstructions,
      difficulty,
      questionTypes,
      numberOfQuestions,
      description,
      examType;

    if (req.file) {
      userInstructions = req.body.topic || req.body.instructions || "";
      difficulty = req.body.difficulty;
      questionTypes = JSON.parse(req.body.questionTypes);
      numberOfQuestions = parseInt(req.body.numberOfQuestions, 10);
      examType = req.body.examType || "general";

      const fileType = validateFileType(req.file.mimetype);

      if (fileType === "invalid") {
        res.status(400).json({
          message: "Invalid file type. Only PDF and image files are allowed.",
        });
        return;
      }

      try {
        let fileText: string;
        if (fileType === "pdf") {
          fileText = await extractTextFromPDF(req.file.buffer);
        } else {
          fileText = await extractTextFromImage(req.file.buffer);
        }

        if (!fileText || fileText.trim().length === 0) {
          res.status(400).json({
            message:
              "No text could be extracted from the uploaded file. Please try a different file or use a text prompt.",
          });
          return;
        }

        if (fileText.length > 2000) {
          fileText = fileText.substring(0, 2000) + "...";
        }

        description = userInstructions
          ? `${userInstructions}\n\nStudy Material:\n${fileText}`
          : fileText;
      } catch (error) {
        console.error("Error extracting text from file:", error);
        res.status(500).json({
          message: "Error processing the uploaded file. Please try again.",
        });
        return;
      }
    } else {
      const {
        topic,
        difficulty,
        questionTypes,
        numberOfQuestions,
        examType: examTypeFromBody,
      } = req.body;
      description = topic || "";
      examType = examTypeFromBody || "general";
    }

    if (!description || description.trim().length === 0) {
      res.status(400).json({
        message: "Content is required (either file or text input)",
      });
      return;
    }

    if (!difficulty || !questionTypes || !numberOfQuestions) {
      res.status(400).json({
        message:
          "Difficulty, questionTypes, and numberOfQuestions are required",
      });
      return;
    }

    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      res.status(400).json({
        message: "At least one question type must be selected",
      });
      return;
    }

    if (numberOfQuestions < 1 || numberOfQuestions > 50) {
      res.status(400).json({
        message: "Number of questions must be between 1 and 50",
      });
      return;
    }

    const prompt = PromptBuilder.buildOptimizedPrompt(description, {
      difficulty,
      questionTypes,
      numberOfQuestions,
      user: { age, grade },
      examType,
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content received from OpenAI");
    }

    const response = JSON.parse(completion.choices[0].message.content);
    console.log("Response from OpenAI:", response.questions);

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    const quiz = await Quiz.create({
      description: description,
      title: response.title,
      questions: response.questions,
      createdBy: userId,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error generating custom quiz:", error);
    res.status(500).json({ message: "Error generating custom quiz" });
  }
};

export const submitQuizResult = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { quizId, questions } = req.body as {
      quizId: string;
      questions: QuestionAnswer[];
    };
    if (!quizId || !questions || !Array.isArray(questions)) {
      res.status(400).json({ message: "Quiz ID and questions are required" });
      return;
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: userId,
    });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    let correctAnswers = 0;
    questions.forEach((q) => {
      const question = quiz.questions[q.questionIndex];
      question.selectedAnswer = q.selectedAnswer;
      if (q.userTextAnswer !== undefined) {
        question.userTextAnswer = q.userTextAnswer;
      }

      let isCorrect = false;
      if (question.questionType === "fill_blank") {
        const normalizeText = (text: string) =>
          text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ");
        const userAnswer = normalizeText(q.userTextAnswer || "");
        const correctAnswer = normalizeText(question.options[0] || "");
        isCorrect = userAnswer === correctAnswer;
      } else {
        isCorrect = q.selectedAnswer === question.correctAnswer;
      }

      if (isCorrect) {
        correctAnswers++;
      }
    });

    await quiz.save();

    await User.findByIdAndUpdate(userId, {
      $inc: {
        "statistics.totalQuizzes": 1,
        "statistics.totalCorrectAnswers": correctAnswers,
      },
    });

    res.status(200).json({
      message: "Quiz results submitted successfully",
      quiz,
    });
  } catch (error) {
    console.error("Error submitting quiz results:", error);
    res
      .status(500)
      .json({ message: "Error submitting quiz results, " + error });
  }
};

export const getQuizHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    const quizzes = await Quiz.find({
      createdBy: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      quizzes,
      totalQuizzes: quizzes.length,
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    res.status(500).json({ message: "Error fetching quiz history" });
  }
};

export const explainAnswer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { quizId, questionIndex, selectedAnswerIndex, correctAnswerIndex } =
      req.body;

    if (!quizId || questionIndex === undefined) {
      res.status(400).json({
        message: "Quiz ID and question index are required",
      });
      return;
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: userId,
    });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    const questionIndexNum = parseInt(questionIndex, 10);
    if (
      isNaN(questionIndexNum) ||
      questionIndexNum < 0 ||
      questionIndexNum >= quiz.questions.length
    ) {
      res.status(400).json({ message: "Invalid question index" });
      return;
    }

    const question = quiz.questions[questionIndexNum];
    const selectedIndex =
      selectedAnswerIndex !== undefined
        ? parseInt(selectedAnswerIndex, 10)
        : undefined;
    const correctIndex =
      correctAnswerIndex !== undefined
        ? parseInt(correctAnswerIndex, 10)
        : question.correctAnswer;

    const isCorrect =
      selectedIndex !== undefined && selectedIndex === correctIndex;

    const prompt = `Explain this quiz question to help the student understand why the answer is correct or incorrect.

Question: ${question.question}
Question Type: ${question.questionType}
Options: ${question.options.join(", ")}

${
  selectedIndex !== undefined
    ? `Selected Answer: ${question.options[selectedIndex]}`
    : "No answer selected"
}
Correct Answer: ${question.options[correctIndex]}

${
  isCorrect
    ? "The student got this correct."
    : "The student got this incorrect."
}

Provide a clear, educational explanation that:
1. Explains why the correct answer is right
${
  !isCorrect && selectedIndex !== undefined
    ? `2. Explains why the selected answer "${question.options[selectedIndex]}" is wrong`
    : ""
}
3. Helps the student understand the concept
4. Uses appropriate language for educational purposes
5. Is concise but thorough (2-3 sentences)

Return a JSON object with this structure:
{
  "explanation": "Your explanation here"
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content received from OpenAI");
    }

    const response = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      explanation: response.explanation || "Explanation not available",
    });
  } catch (error) {
    console.error("Error explaining answer:", error);
    res.status(500).json({ message: "Error generating explanation" });
  }
};

export const deleteQuiz = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: userId,
    });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found or unauthorized" });
      return;
    }

    await Quiz.deleteOne({ _id: quizId });

    await User.findByIdAndUpdate(userId, {
      $inc: { "statistics.totalQuizzes": -1 },
    });

    res.status(200).json({
      message: "Quiz deleted successfully",
      quizId,
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: "Error deleting quiz" });
  }
};
