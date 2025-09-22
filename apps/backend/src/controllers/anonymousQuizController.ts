import dotenv from "dotenv";
import { Response } from "express";
import OpenAI from "openai";
import {
  extractTextFromImage,
  extractTextFromPDF,
  validateFileType,
} from "../helpers/textExtractionHelper";
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
    const { age, grade, difficulty, gender } = user;

    let description: string;

    if (req.file) {
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

        const userPrompt = req.body.prompt;

        if (userPrompt && userPrompt.trim()) {
          description = `Topic/Instruction: ${userPrompt}\n\nSyllabus/Study Material:\n${fileText}`;
        } else {
          description = `Syllabus/Study Material:\n${fileText}`;
        }
      } catch (error) {
        console.error("Error extracting text from file:", error);
        res.status(500).json({
          message: "Error processing the uploaded file. Please try again.",
        });
        return;
      }
    } else {
      description = req.query.prompt as string;

      if (!description) {
        res.status(400).json({
          message: "Either a prompt or a file (PDF/image) is required",
        });
        return;
      }
    }

    const prompt = `Create a comprehensive academic quiz designed specifically for ${age}-year-old students in ${grade} grade to help them excel in their exams. The quiz should have a "${difficulty}" difficulty level.

### 📖 Study Context:
${description}

### 🎯 Academic Goals:
- Focus on key concepts, definitions, and facts that commonly appear in exams
- Include questions that test understanding, application, and critical thinking
- Cover important topics, formulas, processes, and relationships from the syllabus
- Use clear, precise language appropriate for academic assessment
- Include both factual recall and problem-solving questions
- Ensure questions are directly relevant to curriculum and exam patterns
- If a specific topic/instruction is provided, prioritize that focus area
- If syllabus material is provided, ensure questions align with the official curriculum

### 📚 Question Types to Include:
- Definition and concept questions
- Process and procedure questions  
- Problem-solving and application questions
- Comparison and analysis questions
- Formula and calculation questions (if applicable)

### 🎓 Exam Preparation Focus:
- Questions should mirror actual exam question styles
- Include common misconceptions as incorrect options
- Test both surface knowledge and deep understanding
- Cover the most important and frequently tested topics
- Use academic terminology and precise language

Format the response as a JSON object with a title that clearly indicates the topic (avoid generic words like "Quiz" or "Test") and a "questions" array with 10 questions where each question object has:
- question: the question text (required)
- options: array of 4 options (required) 
- correctAnswer: index of the correct answer (0-3) (required)

Example format:
{
  "title": "Photosynthesis Process",
  "questions": [
    {
      "question": "What is the primary function of chlorophyll in photosynthesis?",
      "options": ["Store glucose", "Absorb light energy", "Release oxygen", "Break down water"],
      "correctAnswer": 1
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

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    const quiz = await Quiz.create({
      description: description,
      title: response.title,
      questions: response.questions,
      createdBy: userUuid,
      userType: "anonymous",
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error generating anonymous quiz:", error);
    res.status(500).json({ message: "Error generating quiz" });
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
      if (q.selectedAnswer === question.correctAnswer) {
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
    const userUuid = req.anonymousUser._id;
    const { quizId, userPrompt } = req.body as {
      quizId: string;
      userPrompt: string;
    };

    if (!quizId || !userPrompt) {
      res.status(400).json({ message: "Quiz ID and user prompt are required" });
      return;
    }

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

    const existingQuestions = quiz.questions
      .map((q, index) => `${index + 1}. ${q.question}`)
      .join("\n");

    const prompt = `Continue the academic quiz about "${quiz.description}" based on the user's request: "${userPrompt}"

### 🎯 Context:
This is a continuation of an existing exam preparation quiz. Please generate 5 NEW questions that:
- Build upon the existing topic and difficulty level for continued practice
- Are completely different from the existing questions
- Focus on exam preparation and academic assessment
- Cover additional important concepts from the same syllabus/topic
- Test deeper understanding and application of the subject matter

### 📝 Existing Questions (to avoid duplicates):
${existingQuestions}

### 🎓 Exam Preparation Focus:
- Generate questions that complement the existing ones for comprehensive coverage
- Include questions that test different aspects of the same topic
- Focus on commonly tested concepts that might have been missed
- Ensure questions are directly relevant to exam patterns and curriculum
- Use academic terminology and precise language

### 🚫 Important:
- DO NOT repeat any of the existing questions above
- Create completely new, unique questions that add value to exam preparation
- Maintain the same academic rigor and format
- Keep questions challenging and relevant to actual exams

Format the response as a JSON object with a "questions" array where each question object has:
- question: the question text (required)
- options: array of 4 options (required)
- correctAnswer: index of the correct answer (0-3) (required)

Example format:
{
  "questions": [
    {
      "question": "What is the primary mechanism behind this process?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
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

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    quiz.questions.push(...response.questions);
    await quiz.save();

    res.status(200).json({
      message: "Quiz continued successfully",
      newQuestionsCount: response.questions.length,
      quiz,
    });
  } catch (error) {
    console.error("Error continuing quiz:", error);
    res.status(500).json({ message: "Error continuing quiz" });
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
