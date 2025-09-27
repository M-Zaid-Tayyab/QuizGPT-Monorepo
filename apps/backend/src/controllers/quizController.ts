import dotenv from "dotenv";
import { Response } from "express";
import OpenAI from "openai";
import {
  extractTextFromImage,
  extractTextFromPDF,
  validateFileType,
} from "../helpers/textExtractionHelper";
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
- Mix different question types: Multiple Choice Questions (MCQ), True/False questions, and Fill-in-the-blank questions.

### 📝 Question Types:
- **MCQ Questions**: 4 options with one correct answer
- **True/False Questions**: Simple True or False statements
- **Fill-in-the-blank Questions**: Questions with blanks to fill in (provide correct answers)

### 🎲 Question Distribution:
- Generate 5-6 MCQ questions, 2-3 True/False questions, and 2-3 Fill-in-the-blank questions (total 10 questions)
- Mix the question types randomly throughout the quiz
- For True/False questions, make them clear and unambiguous
- For Fill-in-the-blank questions, use clear blanks (____) and provide the correct answer without unnecessary symbols or units unless essential to the answer

Format the response as a JSON object with a title and a "questions" array with 10 questions where each question object has:
- question: the question text with blanks marked as ____ (required)
- questionType: either "mcq", "true_false", or "fill_blank" (required)
- options: array of 4 options for MCQ, ["True", "False"] for True/False, or [correct_answer] for Fill-in-the-blank (required)
- correctAnswer: index of the correct answer (0-3 for MCQ, 0-1 for True/False, 0 for Fill-in-the-blank) (required)

Example format:
{
  "title": "Animals Quiz",
  "questions": [
    {
      "question": "Which of these animals can fly?",
      "questionType": "mcq",
      "options": ["Dog", "Elephant", "Parrot", "Lion"],
      "correctAnswer": 2
    },
    {
      "question": "All birds can fly.",
      "questionType": "true_false",
      "options": ["True", "False"],
      "correctAnswer": 1
    },
    {
      "question": "3/10 as a percentage is ____.",
      "questionType": "fill_blank",
      "options": ["30"],
      "correctAnswer": 0
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

export const generateCustomQuiz = async (
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
    const { age, grade, gender } = user;

    // Handle both form data (with file) and JSON data
    let topic, difficulty, questionTypes, numberOfQuestions, description;

    if (req.file) {
      // Handle file upload case
      topic = req.body.topic;
      difficulty = req.body.difficulty;
      questionTypes = JSON.parse(req.body.questionTypes);
      numberOfQuestions = parseInt(req.body.numberOfQuestions, 10);

      // Process the uploaded file
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

        description = `Topic: ${topic}\n\nStudy Material:\n${fileText}`;
      } catch (error) {
        console.error("Error extracting text from file:", error);
        res.status(500).json({
          message: "Error processing the uploaded file. Please try again.",
        });
        return;
      }
    } else {
      // Handle JSON case
      ({ topic, difficulty, questionTypes, numberOfQuestions } = req.body);
      description = topic;
    }

    if (!topic || !difficulty || !questionTypes || !numberOfQuestions) {
      res.status(400).json({
        message:
          "Topic, difficulty, questionTypes, and numberOfQuestions are required",
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

    // Create question type distribution
    const questionTypeDistribution = questionTypes.join(", ");
    const mcqCount = Math.ceil(numberOfQuestions * 0.6);
    const trueFalseCount = Math.ceil(numberOfQuestions * 0.2);
    const fillBlankCount = numberOfQuestions - mcqCount - trueFalseCount;

    const prompt = `Create a comprehensive educational quiz about "${description}" designed specifically for a ${age}-year-old ${gender} student in ${grade} grade. The quiz should have a "${difficulty}" difficulty level.

### 🎯 Academic Goals:
- Focus on key concepts, definitions, and facts from the provided content
- Include questions that test understanding, application, and critical thinking
- Use clear, precise language appropriate for academic assessment
- Ensure questions are directly relevant to the content
- Make the quiz engaging and educational

### 📚 Question Types to Include:
- Generate ${mcqCount} Multiple Choice Questions (MCQ) with 4 options each
- Generate ${trueFalseCount} True/False questions
- Generate ${fillBlankCount} Fill-in-the-blank questions
- Mix the question types randomly throughout the quiz
- For True/False questions, make them clear and unambiguous
- For Fill-in-the-blank questions, use clear blanks (____) and provide the correct answer

### 🎓 Content Focus:
- Questions should cover the most important aspects of the provided content
- Include both factual recall and problem-solving questions
- Use academic terminology and precise language
- Cover key concepts, processes, and relationships

Format the response as a JSON object with a title that clearly indicates the topic and a "questions" array with ${numberOfQuestions} questions where each question object has:
- question: the question text with blanks marked as ____ (required)
- questionType: either "mcq", "true_false", or "fill_blank" (required)
- options: array of 4 options for MCQ, ["True", "False"] for True/False, or [correct_answer] for Fill-in-the-blank (required)
- correctAnswer: index of the correct answer (0-3 for MCQ, 0-1 for True/False, 0 for Fill-in-the-blank) (required)

Example format:
{
  "title": "${topic} Quiz",
  "questions": [
    {
      "question": "What is the primary function of chlorophyll in photosynthesis?",
      "questionType": "mcq",
      "options": ["Store glucose", "Absorb light energy", "Release oxygen", "Break down water"],
      "correctAnswer": 1
    },
    {
      "question": "Photosynthesis only occurs in green plants.",
      "questionType": "true_false",
      "options": ["True", "False"],
      "correctAnswer": 1
    },
    {
      "question": "The process of photosynthesis converts light energy into ____ energy.",
      "questionType": "fill_blank",
      "options": ["chemical"],
      "correctAnswer": 0
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
    console.error("Error generating custom quiz:", error);
    res.status(500).json({ message: "Error generating custom quiz" });
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
