import dotenv from "dotenv";
import { Response } from "express";
import OpenAI from "openai";
import {
  extractTextFromImage,
  extractTextFromPDF,
  validateFileType,
} from "../helpers/textExtractionHelper";
import { UnifiedAuthRequest } from "../middleware/unifiedAuthMiddleware";
import AnonymousUser from "../models/anonymousUserModel";
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

export const generateQuiz = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const user = req.user;
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

Please respond with a valid JSON object containing the quiz questions.

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
      userType: userType,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ message: "Error generating quiz" });
  }
};

export const generateCustomQuiz = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { age, grade, gender } = user;

    let topic, difficulty, questionTypes, numberOfQuestions, description;

    if (req.file) {
      topic = req.body.topic;
      difficulty = req.body.difficulty;
      questionTypes = JSON.parse(req.body.questionTypes);
      numberOfQuestions = parseInt(req.body.numberOfQuestions, 10);

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

    const questionTypeDistribution = questionTypes.join(", ");
    const mcqCount = Math.ceil(numberOfQuestions * 0.6);
    const trueFalseCount = Math.ceil(numberOfQuestions * 0.2);
    const fillBlankCount = numberOfQuestions - mcqCount - trueFalseCount;

    const prompt = `Create a comprehensive educational quiz about "${description}" designed specifically for a ${age}-year-old ${gender} student in ${grade} grade. The quiz should have a "${difficulty}" difficulty level.

Please respond with a valid JSON object containing the quiz questions.

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
      userType: userType,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error generating custom quiz:", error);
    res.status(500).json({ message: "Error generating custom quiz" });
  }
};

export const submitQuizResult = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
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
      userType: userType,
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

    // Update user statistics (works for both User and AnonymousUser)
    if (userType === "user") {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalQuizzes": 1,
          "statistics.totalCorrectAnswers": correctAnswers,
        },
      });
    } else {
      await AnonymousUser.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalQuizzes": 1,
          "statistics.totalCorrectAnswers": correctAnswers,
        },
      });
    }

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
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const user = req.user;

    const quizzes = await Quiz.find({
      createdBy: userId,
      userType: userType,
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
