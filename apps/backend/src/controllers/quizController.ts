import dotenv from "dotenv";
import { Response } from "express";
import OpenAI from "openai";
import { AuthRequest } from "../middleware/authMiddleware";
import Quiz from "../models/quizModel";
import User from "../models/userModel";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionAnswer {
  questionIndex: number;
  selectedAnswer: number;
}

export const generateQuiz = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { age, grade, difficulty, gender } = user;

    const description = req.query.prompt as string;

    if (!description) {
      res.status(400).json({ message: "Description is required" });
      return;
    }

    const prompt = `Create an educational, fun, and highly engaging quiz about the topic "${description}" designed specifically for a ${age}-year-old ${gender} kid in ${grade} grade. The quiz should have a "${difficulty}" level of challenge.

### 🎯 Goals:
- Make the quiz feel like a game, not a test.
- Use imaginative, real-world, or playful scenarios to explain concepts.
- Include surprising, creative, and unpredictable elements.
- Keep questions short, challenging, and relevant to the topic.
- Randomize both the questions and the order of the options.
- Each question should encourage curiosity and critical thinking.

Format the response as a JSON object with a title and a "questions" array with 10 questions where each question object has:
- question: the question text (required)
- options: array of 4 options (required)
- correctAnswer: index of the correct answer (0-3) (required)

Example format:
{
  "title": "Animals Quiz",
  "questions": [
    {
      "question": "Which of these animals can fly?",
      "options": ["Dog", "Elephant", "Parrot", "Lion"],
      "correctAnswer": 2
    }
  ]
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
    console.log("Response from OpenAI:", response.questions);

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    const quiz = await Quiz.create({
      description: description,
      title: response.title,
      questions: response.questions,
      createdBy: userId,
      userType: "user",
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ message: "Error generating quiz" });
  }
};

export const submitQuizResult = async (
  req: AuthRequest,
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

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    let correctAnswers = 0;
    questions.forEach((q) => {
      const question = quiz.questions[q.questionIndex];
      question.selectedAnswer = q.selectedAnswer;
      if (q.selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    await quiz.save();

    const user = await User.findById(userId);
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
    console.error("Error submitting quiz results:", error);
    res
      .status(500)
      .json({ message: "Error submitting quiz results, " + error });
  }
};

export const getQuizHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    const quizzes = await Quiz.find({ createdBy: userId }).sort({
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
