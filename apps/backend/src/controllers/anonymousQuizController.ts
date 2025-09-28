import dotenv from "dotenv";
import { Response } from "express";
import OpenAI from "openai";
import { PromptBuilder } from "../helpers/promptBuilder";
import {
  ContinueLearningHelper,
  InputProcessor,
  QuestionValidator,
  QuizErrorHandler,
  QuizOptions,
} from "../helpers/quizGenerationHelpers";
import { AnonymousAuthRequest } from "../middleware/anonymousAuthMiddleware";
import AnonymousUser from "../models/anonymousUserModel";
import Quiz from "../models/quizModel";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionAnswer {
  questionIndex: number;
  selectedAnswer: number;
  userTextAnswer?: string;
}

export const generateAnonymousQuiz = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userUuid = req.anonymousUser._id;
    const user = await AnonymousUser.findById(userUuid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const requestData = await InputProcessor.extractRequestData(req);

    const description = await InputProcessor.processInput(
      requestData.topic,
      requestData.file
    );

    if (!description) {
      res.status(400).json({
        message: "Either a prompt or a file (PDF/image) is required",
      });
      return;
    }

    if (
      !requestData.topic ||
      !requestData.difficulty ||
      !requestData.questionTypes ||
      !requestData.numberOfQuestions
    ) {
      res.status(400).json({
        message:
          "Topic, difficulty, questionTypes, and numberOfQuestions are required",
      });
      return;
    }

    if (
      !Array.isArray(requestData.questionTypes) ||
      requestData.questionTypes.length === 0
    ) {
      res.status(400).json({
        message: "At least one question type must be selected",
      });
      return;
    }

    if (
      requestData.numberOfQuestions < 1 ||
      requestData.numberOfQuestions > 50
    ) {
      res.status(400).json({
        message: "Number of questions must be between 1 and 50",
      });
      return;
    }

    const quizOptions: QuizOptions = {
      difficulty: requestData.difficulty,
      questionTypes: requestData.questionTypes,
      numberOfQuestions: requestData.numberOfQuestions,
      user: user,
    };

    const prompt = PromptBuilder.buildOptimizedPrompt(description, quizOptions);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content received from OpenAI");
    }

    const response = JSON.parse(completion.choices[0].message.content);

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    const cleanedQuestions = QuestionValidator.validateAndCleanQuestions(
      response.questions
    );

    const quiz = await Quiz.create({
      description: description,
      title: response.title,
      questions: cleanedQuestions,
      createdBy: userUuid,
      userType: "anonymous",
    });

    res.status(201).json(quiz);
  } catch (error) {
    QuizErrorHandler.handleError(error, res);
  }
};

export const submitAnonymousQuizResult = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userUuid = req.anonymousUser._id;
    const { quizId, questions } = req.body as {
      quizId: string;
      questions: QuestionAnswer[];
    };
    if (!quizId || !questions || !Array.isArray(questions)) {
      res.status(400).json({ message: "Quiz ID and questions are required" });
      return;
    }

    const quiz = await Quiz.findById(quizId);
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

      // Check if answer is correct based on question type
      let isCorrect = false;
      if (question.questionType === "fill_blank") {
        // For fill-in-the-blank, compare the actual text content
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
        // For MCQ and True/False, use the existing index comparison
        isCorrect = q.selectedAnswer === question.correctAnswer;
      }

      if (isCorrect) {
        correctAnswers++;
      }
    });

    await quiz.save();

    const user = await AnonymousUser.findById(userUuid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.statistics) {
      user.statistics = {
        totalQuizzes: 0,
        averageScore: 0,
        totalCorrectAnswers: 0,
      };
    }

    if (!user.streak) {
      user.streak = {
        current: 0,
        longest: 0,
        lastQuizDate: null,
      };
    }

    user.statistics.totalQuizzes += 1;
    user.statistics.totalCorrectAnswers += correctAnswers;
    user.statistics.averageScore =
      (user.statistics.averageScore * (user.statistics.totalQuizzes - 1) +
        correctAnswers) /
      user.statistics.totalQuizzes;

    const today = new Date();
    const lastQuizDate = user.streak.lastQuizDate;
    if (!lastQuizDate) {
      user.streak.current = 1;
      user.streak.longest = 1;
    } else {
      const lastQuizUTC = new Date(lastQuizDate.toISOString());
      const todayUTC = new Date(today.toISOString());
      lastQuizUTC.setUTCHours(0, 0, 0, 0);
      todayUTC.setUTCHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (todayUTC.getTime() - lastQuizUTC.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
      } else if (diffDays === 1) {
        user.streak.current += 1;
        if (user.streak.current > user.streak.longest) {
          user.streak.longest = user.streak.current;
        }
      } else {
        user.streak.current = 1;
      }
    }

    user.streak.lastQuizDate = today;
    await user.save();

    res.status(200).json({
      message: "Quiz results submitted successfully",
      statistics: user.statistics,
      streak: user.streak,
      quiz,
    });
  } catch (error) {
    console.error("Error submitting anonymous quiz results:", error);
    res
      .status(500)
      .json({ message: "Error submitting quiz results, " + error });
  }
};

export const getAnonymousQuizHistory = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userUuid = req.anonymousUser._id;

    const quizzes = await Quiz.find({ createdBy: userUuid }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      quizzes,
      totalQuizzes: quizzes.length,
    });
  } catch (error) {
    console.error("Error fetching anonymous quiz history:", error);
    res.status(500).json({ message: "Error fetching quiz history" });
  }
};

export const continueLearning = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 1. Get user and validate request
    const userUuid = req.anonymousUser._id;
    const { quizId, userPrompt } = req.body as {
      quizId: string;
      userPrompt: string;
    };

    if (!quizId || !userPrompt) {
      res.status(400).json({ message: "Quiz ID and user prompt are required" });
      return;
    }

    // 2. Get quiz and validate ownership
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    if (quiz.createdBy.toString() !== userUuid.toString()) {
      res
        .status(403)
        .json({ message: "Access denied. This quiz doesn't belong to you." });
      return;
    }

    // 3. Get user context
    const user = await AnonymousUser.findById(userUuid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 4. Extract quiz context (difficulty, question types, etc.)
    const quizContext = ContinueLearningHelper.extractQuizContext(quiz, user);

    // 5. Prepare existing questions for context
    const existingQuestions = quiz.questions.map((q) => q.question);

    // 6. Build optimized prompt
    const prompt = ContinueLearningHelper.buildContinueLearningPrompt(
      quizContext.description,
      userPrompt,
      existingQuestions,
      {
        difficulty: quizContext.difficulty,
        questionTypes: quizContext.questionTypes,
        user: quizContext.userContext,
      }
    );

    // 7. Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content received from OpenAI");
    }

    const response = JSON.parse(completion.choices[0].message.content);

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // 8. Validate and clean new questions
    const cleanedQuestions = QuestionValidator.validateAndCleanQuestions(
      response.questions
    );

    // 9. Add new questions to quiz
    quiz.questions.push(...cleanedQuestions);
    await quiz.save();

    res.status(200).json({
      message: "Quiz continued successfully",
      newQuestionsCount: cleanedQuestions.length,
      quiz,
    });
  } catch (error) {
    QuizErrorHandler.handleError(error, res);
  }
};

export const explainAnswer = async (
  req: AnonymousAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userUuid = req.anonymousUser._id;
    const user = await AnonymousUser.findById(userUuid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { age, grade, gender } = user;
    const { quizId, questionIndex, correctAnswerIndex, selectedAnswerIndex } =
      req.body as {
        quizId: string;
        questionIndex: number;
        correctAnswerIndex: number;
        selectedAnswerIndex: number;
      };

    if (!quizId) {
      res.status(400).json({ message: "Quiz ID is required" });
      return;
    }
    if (!questionIndex) {
      res.status(400).json({ message: "Question index is required" });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    const question = quiz.questions[questionIndex];
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    const prompt = `Explain why you think the answer to the question: ${question.question} is "${question.options[correctAnswerIndex]}" and not "${question.options[selectedAnswerIndex]}" in a way that is easy to understand for a ${age} year old ${gender} kid in ${grade} grade for educational purposes with an example in 3-5 sentences.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content received from OpenAI");
    }

    const explanation = completion.choices[0].message.content;

    res.status(200).json({ explanation });
  } catch (error) {
    console.error("Error explaining answer:", error);
    res.status(500).json({ message: "Error explaining answer" });
  }
};
