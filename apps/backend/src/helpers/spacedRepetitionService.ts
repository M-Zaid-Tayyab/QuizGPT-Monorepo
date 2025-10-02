import Flashcard from "../models/flashcardModel";
import StudyProgress from "../models/studyProgressModel";

export type ReviewResponse = "again" | "hard" | "good" | "easy";

export interface SpacedRepetitionResult {
  nextInterval: number;
  nextEase: number;
  nextRepetitions: number;
  masteryLevel: "learning" | "reviewing" | "mastered";
}

export class SpacedRepetitionService {
  /**
   * Calculate next review parameters using SuperMemo algorithm
   */
  static calculateNextReview(
    currentInterval: number,
    repetitions: number,
    ease: number,
    response: ReviewResponse
  ): SpacedRepetitionResult {
    let newInterval: number;
    let newEase = ease;
    let newRepetitions = repetitions;
    let masteryLevel: "learning" | "reviewing" | "mastered" = "learning";

    switch (response) {
      case "again":
        // Reset to beginning
        newInterval = 1;
        newEase = Math.max(1.3, ease - 0.2);
        newRepetitions = 0;
        masteryLevel = "learning";
        break;

      case "hard":
        // Slight progress
        newInterval = Math.max(1, Math.round(currentInterval * 1.2));
        newEase = Math.max(1.3, ease - 0.15);
        newRepetitions += 1;
        masteryLevel = repetitions === 0 ? "learning" : "reviewing";
        break;

      case "good":
        // Normal progress
        newInterval = Math.round(currentInterval * ease);
        newRepetitions += 1;
        masteryLevel = repetitions === 0 ? "learning" : "reviewing";
        break;

      case "easy":
        // Excellent progress
        newInterval = Math.round(currentInterval * ease * 1.3);
        newEase = Math.min(2.5, ease + 0.15);
        newRepetitions += 1;
        masteryLevel = repetitions >= 2 ? "mastered" : "reviewing";
        break;
    }

    // Cap the interval at 365 days
    newInterval = Math.min(newInterval, 365);

    return {
      nextInterval: newInterval,
      nextEase: Math.round(newEase * 100) / 100,
      nextRepetitions: newRepetitions,
      masteryLevel,
    };
  }

  /**
   * Get cards due for review for a specific user
   */
  static async getCardsForReview(
    userId: string,
    userType: "user" | "anonymous" = "anonymous",
    limit: number = 20
  ): Promise<any[]> {
    const now = new Date();

    return await Flashcard.find({
      createdBy: userId,
      userType,
      nextReview: { $lte: now },
    })
      .limit(limit)
      .sort({ nextReview: 1 })
      .lean();
  }

  /**
   * Get all cards for a user (for cram mode)
   */
  static async getAllUserCards(
    userId: string,
    userType: "user" | "anonymous" = "anonymous",
    deckId?: string
  ): Promise<any[]> {
    const query: any = {
      createdBy: userId,
      userType,
    };

    if (deckId) {
      // This would require a lookup to find flashcards in a specific deck
      // For now, we'll implement this in the controller
    }

    return await Flashcard.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Submit a review response and update card progress
   */
  static async submitReview(
    userId: string,
    flashcardId: string,
    response: ReviewResponse,
    responseTime: number,
    studyMode:
      | "spaced_repetition"
      | "cram"
      | "test"
      | "match" = "spaced_repetition"
  ): Promise<{ success: boolean; nextReview?: Date }> {
    try {
      // Get the flashcard
      const flashcard = await Flashcard.findById(flashcardId);
      if (!flashcard) {
        throw new Error("Flashcard not found");
      }

      // Calculate new spaced repetition parameters
      const result = this.calculateNextReview(
        flashcard.interval,
        flashcard.repetitions,
        flashcard.ease,
        response
      );

      // Calculate next review date
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + result.nextInterval);

      // Update flashcard
      await Flashcard.findByIdAndUpdate(flashcardId, {
        interval: result.nextInterval,
        repetitions: result.nextRepetitions,
        ease: result.nextEase,
        lastReviewed: new Date(),
        nextReview,
        correctCount:
          response !== "again"
            ? flashcard.correctCount + 1
            : flashcard.correctCount,
        incorrectCount:
          response === "again"
            ? flashcard.incorrectCount + 1
            : flashcard.incorrectCount,
      });

      // Update or create study progress
      await this.updateStudyProgress(
        userId,
        flashcardId,
        response,
        responseTime,
        studyMode,
        result
      );

      return {
        success: true,
        nextReview,
      };
    } catch (error) {
      console.error("Error submitting review:", error);
      return { success: false };
    }
  }

  /**
   * Update study progress for a flashcard
   */
  private static async updateStudyProgress(
    userId: string,
    flashcardId: string,
    response: ReviewResponse,
    responseTime: number,
    studyMode: string,
    result: SpacedRepetitionResult
  ): Promise<void> {
    const studySession = {
      date: new Date(),
      response,
      responseTime,
      correct: response !== "again",
      studyMode,
    };

    await StudyProgress.findOneAndUpdate(
      { userId, flashcardId },
      {
        $set: {
          interval: result.nextInterval,
          repetitions: result.nextRepetitions,
          ease: result.nextEase,
          lastReviewed: new Date(),
          nextReview: new Date(
            Date.now() + result.nextInterval * 24 * 60 * 60 * 1000
          ),
          masteryLevel: result.masteryLevel,
        },
        $push: { studySessions: studySession },
        $inc: {
          totalStudyTime: responseTime,
        },
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get study statistics for a user
   */
  static async getStudyStatistics(
    userId: string,
    userType: "user" | "anonymous" = "anonymous"
  ): Promise<{
    totalCards: number;
    cardsDue: number;
    cardsLearning: number;
    cardsReviewing: number;
    cardsMastered: number;
    averageAccuracy: number;
    totalStudyTime: number;
  }> {
    const now = new Date();

    const [totalCards, cardsDue, studyProgress] = await Promise.all([
      Flashcard.countDocuments({ createdBy: userId, userType }),
      Flashcard.countDocuments({
        createdBy: userId,
        userType,
        nextReview: { $lte: now },
      }),
      StudyProgress.find({ userId, userType }),
    ]);

    const cardsLearning = studyProgress.filter(
      (p) => p.masteryLevel === "learning"
    ).length;
    const cardsReviewing = studyProgress.filter(
      (p) => p.masteryLevel === "reviewing"
    ).length;
    const cardsMastered = studyProgress.filter(
      (p) => p.masteryLevel === "mastered"
    ).length;

    const totalStudyTime = studyProgress.reduce(
      (sum, p) => sum + p.totalStudyTime,
      0
    );

    const totalSessions = studyProgress.reduce(
      (sum, p) => sum + p.studySessions.length,
      0
    );
    const correctSessions = studyProgress.reduce(
      (sum, p) => sum + p.studySessions.filter((s) => s.correct).length,
      0
    );
    const averageAccuracy =
      totalSessions > 0 ? (correctSessions / totalSessions) * 100 : 0;

    return {
      totalCards,
      cardsDue,
      cardsLearning,
      cardsReviewing,
      cardsMastered,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      totalStudyTime: Math.round(totalStudyTime / 1000 / 60), // Convert to minutes
    };
  }
}
