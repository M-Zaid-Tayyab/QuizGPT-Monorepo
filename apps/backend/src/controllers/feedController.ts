import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Deck from "../models/deckModel";
import Quiz from "../models/quizModel";

export const getFeed = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Fetch both in parallel
    const [quizzes, decks, totalQuizzes, totalDecks] = await Promise.all([
      Quiz.find({ createdBy: userId })
        .select("_id title description createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Deck.find({ createdBy: userId })
        .select("_id name createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Quiz.countDocuments({ createdBy: userId }),
      Deck.countDocuments({ createdBy: userId }),
    ]);

    // Transform and merge
    const items = [
      ...quizzes.map((q) => ({
        _id: q._id,
        title: q.title || q.description || "Quiz",
        createdAt: q.createdAt,
        type: "quiz" as const,
      })),
      ...decks.map((d) => ({
        _id: d._id,
        title: d.name,
        createdAt: d.createdAt,
        type: "deck" as const,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(skip, skip + limit);

    const total = totalQuizzes + totalDecks;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Error fetching feed" });
  }
};
