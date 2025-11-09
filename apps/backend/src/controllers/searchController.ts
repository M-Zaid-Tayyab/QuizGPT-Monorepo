import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Deck from "../models/deckModel";
import Quiz from "../models/quizModel";

export const searchStudySets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      res.status(400).json({
        message: "Search query is required",
        results: [],
      });
      return;
    }

    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, "i");

    const quizzes = await Quiz.find({
      createdBy: userId,
      $or: [{ description: searchRegex }, { title: searchRegex }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const decks = await Deck.find({
      createdBy: userId,
      name: searchRegex,
    })
      .populate("flashcards")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const results = [
      ...quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title?.trim() || quiz.description?.trim() || "Quiz",
        createdAt: quiz.createdAt,
        type: "quiz",
        raw: quiz,
      })),
      ...decks.map((deck) => ({
        _id: deck._id,
        title: deck.name,
        createdAt: deck.createdAt,
        type: "deck",
        raw: deck,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      results,
      count: results.length,
      query: searchQuery,
    });
  } catch (error) {
    console.error("Error searching study sets:", error);
    res.status(500).json({ message: "Error searching study sets" });
  }
};
