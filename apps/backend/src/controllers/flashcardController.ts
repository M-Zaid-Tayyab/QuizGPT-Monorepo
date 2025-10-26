import { Response } from "express";
import {
  FlashcardGenerator,
  FlashcardOptions,
} from "../helpers/flashcardGenerator";
import { InputProcessor } from "../helpers/quizGenerationHelpers";
import {
  ReviewResponse,
  SpacedRepetitionService,
} from "../helpers/spacedRepetitionService";
import { UnifiedAuthRequest } from "../middleware/unifiedAuthMiddleware";
import AnonymousUser from "../models/anonymousUserModel";
import Deck from "../models/deckModel";
import Flashcard from "../models/flashcardModel";
import userModel from "../models/userModel";

// Unified function that works with both user types
export const generateFlashcards = async (
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

    const {
      text,
      category = "General",
      count = 10,
      difficulty = user.difficulty || "Medium",
    } = req.body;

    if (!text || text.trim().length === 0) {
      res.status(400).json({ message: "Text content is required" });
      return;
    }

    if (count < 1 || count > 50) {
      res.status(400).json({ message: "Count must be between 1 and 50" });
      return;
    }

    const options: FlashcardOptions = {
      difficulty,
      category,
      count,
      user: {
        age: user.age || 20,
        grade: user.grade || "College",
        gender: user.gender || "Other",
      },
      sourceMaterial: text,
      generatedFrom: "text",
    };

    const flashcards = await FlashcardGenerator.generateFromText(text, options);

    if (flashcards.length === 0) {
      res.status(400).json({
        message: "No flashcards could be generated from the provided text",
      });
      return;
    }

    // Save flashcards to database
    const savedFlashcards = await Promise.all(
      flashcards.map((flashcardData) =>
        Flashcard.create({
          ...flashcardData,
          createdBy: userId, // Works for both ObjectId and String UUID
          userType: userType, // "user" or "anonymous"
          sourceMaterial: text,
          generatedFrom: "text",
        })
      )
    );

    // Create a new deck with AI-generated meta
    const deckMeta = await FlashcardGenerator.generateDeckMeta(text, options);
    const deck = await Deck.create({
      name: deckMeta.name,
      description: deckMeta.description,
      flashcards: savedFlashcards.map((f) => f._id),
      createdBy: userId, // Works for both ObjectId and String UUID
      userType: userType, // "user" or "anonymous"
      category,
      difficulty,
      sourceMaterial: text,
      generatedFrom: "text",
    });

    // Update user statistics (works for both User and AnonymousUser)
    if (userType === "user") {
      await userModel.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalFlashcards": savedFlashcards.length,
          "statistics.totalDecks": 1,
        },
      });
    } else {
      await AnonymousUser.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalFlashcards": savedFlashcards.length,
          "statistics.totalDecks": 1,
        },
      });
    }

    res.status(201).json({
      message: "Flashcards generated successfully",
      flashcards: savedFlashcards,
      deck,
      count: savedFlashcards.length,
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateFlashcardsFromFile = async (
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

    const requestData = await InputProcessor.extractRequestData(req);
    const text = await InputProcessor.processInput(
      requestData.topic,
      requestData.file
    );

    if (!text) {
      res
        .status(400)
        .json({ message: "No text could be extracted from the file" });
      return;
    }

    const options: FlashcardOptions = {
      difficulty: requestData.difficulty || user.difficulty || "Medium",
      category: requestData.topic || "General",
      count: requestData.numberOfQuestions || 10,
      user: {
        age: user.age || 20,
        grade: user.grade || "College",
        gender: user.gender || "Other",
      },
      sourceMaterial: text,
      generatedFrom: requestData.file ? "pdf" : "text",
    };

    const flashcards = await FlashcardGenerator.generateFromText(text, options);

    if (flashcards.length === 0) {
      res
        .status(400)
        .json({ message: "No flashcards could be generated from the file" });
      return;
    }

    // Save flashcards to database
    const savedFlashcards = await Promise.all(
      flashcards.map((flashcardData) =>
        Flashcard.create({
          ...flashcardData,
          createdBy: userId,
          userType: userType,
          sourceMaterial: text,
          generatedFrom: requestData.file ? "pdf" : "text",
        })
      )
    );

    // Create a new deck with AI-generated meta
    const deckMeta = await FlashcardGenerator.generateDeckMeta(text, options);
    const deck = await Deck.create({
      name: deckMeta.name,
      description: deckMeta.description,
      flashcards: savedFlashcards.map((f) => f._id),
      createdBy: userId,
      userType: userType,
      category: options.category,
      difficulty: options.difficulty,
      sourceMaterial: text,
      generatedFrom: requestData.file ? "pdf" : "text",
    });

    // Update user statistics (works for both User and AnonymousUser)
    if (userType === "user") {
      await userModel.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalFlashcards": savedFlashcards.length,
          "statistics.totalDecks": 1,
        },
      });
    } else {
      await AnonymousUser.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalFlashcards": savedFlashcards.length,
          "statistics.totalDecks": 1,
        },
      });
    }

    res.status(201).json({
      message: "Flashcards generated successfully",
      flashcards: savedFlashcards,
      deck,
      count: savedFlashcards.length,
    });
  } catch (error) {
    console.error("Error generating flashcards from file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateFlashcardsFromQuiz = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const user = req.user;

    // Get the quiz (you'll need to implement this based on your quiz model)
    // For now, we'll assume the quiz data is passed in the request body
    const { quiz } = req.body;

    if (!quiz || !quiz.questions) {
      res.status(400).json({ message: "Quiz data is required" });
      return;
    }

    const flashcards = await FlashcardGenerator.generateFromQuiz(quiz);

    if (flashcards.length === 0) {
      res
        .status(400)
        .json({ message: "No flashcards could be generated from the quiz" });
      return;
    }

    // Save flashcards to database
    const savedFlashcards = await Promise.all(
      flashcards.map((flashcardData) =>
        Flashcard.create({
          ...flashcardData,
          createdBy: userId,
          userType: userType,
          sourceMaterial: quiz.description || "Quiz",
          generatedFrom: "quiz",
        })
      )
    );

    // Create a new deck
    const deck = await Deck.create({
      name: `${quiz.title} Flashcards`,
      description: `Flashcards generated from quiz: ${quiz.title}`,
      flashcards: savedFlashcards.map((f) => f._id),
      createdBy: userId,
      userType: userType,
      category: quiz.title,
      difficulty: "Medium",
      sourceMaterial: quiz.description || "Quiz",
      generatedFrom: "quiz",
    });

    // Update user statistics (works for both User and AnonymousUser)
    if (userType === "user") {
      await userModel.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalFlashcards": savedFlashcards.length,
          "statistics.totalDecks": 1,
        },
      });
    } else {
      await AnonymousUser.findByIdAndUpdate(userId, {
        $inc: {
          "statistics.totalFlashcards": savedFlashcards.length,
          "statistics.totalDecks": 1,
        },
      });
    }

    res.status(201).json({
      message: "Flashcards generated successfully",
      flashcards: savedFlashcards,
      deck,
      count: savedFlashcards.length,
    });
  } catch (error) {
    console.error("Error generating flashcards from quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserDecks = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { page = 1, limit = 20, category, difficulty } = req.query;

    const query: any = {
      createdBy: userId,
      userType: userType,
    };

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const decks = await Deck.find(query)
      .populate("flashcards")
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Deck.countDocuments(query);

    res.status(200).json({
      decks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting user decks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createDeck = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { name, description, category, difficulty, color } = req.body;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ message: "Deck name is required" });
      return;
    }

    const deck = await Deck.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userId,
      userType: userType,
      category: category || "General",
      difficulty: difficulty || "Medium",
      color: color || "#FF6B6B",
    });

    // Update user statistics (works for both User and AnonymousUser)
    if (userType === "user") {
      await userModel.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalDecks": 1 },
      });
    } else {
      await AnonymousUser.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalDecks": 1 },
      });
    }

    res.status(201).json({
      message: "Deck created successfully",
      deck,
    });
  } catch (error) {
    console.error("Error creating deck:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDeckFlashcards = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { deckId } = req.params;

    const deck = await Deck.findOne({
      _id: deckId,
      createdBy: userId,
      userType: userType,
    }).populate("flashcards");

    if (!deck) {
      res.status(404).json({ message: "Deck not found" });
      return;
    }

    res.status(200).json({
      deck,
      flashcards: deck.flashcards,
      count: deck.flashcards.length,
    });
  } catch (error) {
    console.error("Error getting deck flashcards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCardsForReview = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { limit = 20, deckId } = req.query;

    let cards;
    if (deckId) {
      // Get cards from specific deck
      const deck = await Deck.findOne({
        _id: deckId,
        createdBy: userId,
        userType: userType,
      }).populate("flashcards");

      if (!deck) {
        res.status(404).json({ message: "Deck not found" });
        return;
      }

      const now = new Date();
      cards = deck.flashcards.filter((card: any) => card.nextReview <= now);
    } else {
      // Get all cards due for review
      cards = await SpacedRepetitionService.getCardsForReview(
        userId,
        "anonymous",
        Number(limit)
      );
    }

    res.status(200).json({
      cards,
      count: cards.length,
    });
  } catch (error) {
    console.error("Error getting cards for review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitReview = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { flashcardId } = req.params;
    const {
      response,
      responseTime,
      studyMode = "spaced_repetition",
    } = req.body;

    if (!response || !["again", "hard", "good", "easy"].includes(response)) {
      res.status(400).json({ message: "Valid response is required" });
      return;
    }

    const result = await SpacedRepetitionService.submitReview(
      userId,
      flashcardId,
      response as ReviewResponse,
      responseTime || 0,
      studyMode
    );

    if (!result.success) {
      res.status(400).json({ message: "Failed to submit review" });
      return;
    }

    // Update user statistics (works for both User and AnonymousUser)
    if (userType === "user") {
      await userModel.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalStudySessions": 1 },
      });
    } else {
      await AnonymousUser.findByIdAndUpdate(userId, {
        $inc: { "statistics.totalStudySessions": 1 },
      });
    }

    res.status(200).json({
      message: "Review submitted successfully",
      nextReview: result.nextReview,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudyProgress = async (
  req: UnifiedAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const userType = req.userType;

    const statistics = await SpacedRepetitionService.getStudyStatistics(
      userId,
      userType
    );

    res.status(200).json({
      statistics,
    });
  } catch (error) {
    console.error("Error getting study progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};
