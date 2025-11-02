import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  response: {
    type: String,
    enum: ["again", "hard", "good", "easy"],
    required: true,
  },
  responseTime: {
    type: Number, // milliseconds
    required: true,
  },
  correct: {
    type: Boolean,
    required: true,
  },
  studyMode: {
    type: String,
    enum: ["spaced_repetition", "cram", "test", "match"],
    default: "spaced_repetition",
  },
});

const studyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userType: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    flashcardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flashcard",
      required: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
    // Spaced Repetition State
    interval: {
      type: Number,
      default: 1,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    ease: {
      type: Number,
      default: 2.5,
    },
    lastReviewed: {
      type: Date,
      default: Date.now,
    },
    nextReview: {
      type: Date,
      default: Date.now,
    },
    // Study Session Data
    studySessions: [studySessionSchema],
    // Mastery Level
    masteryLevel: {
      type: String,
      enum: ["learning", "reviewing", "mastered"],
      default: "learning",
    },
    // Performance metrics
    totalStudyTime: {
      type: Number, // total milliseconds
      default: 0,
    },
    averageResponseTime: {
      type: Number, // average milliseconds
      default: 0,
    },
    accuracy: {
      type: Number, // percentage 0-100
      default: 0,
    },
    // Streak tracking
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for performance
studyProgressSchema.index({ userId: 1, nextReview: 1 });
studyProgressSchema.index({ userId: 1, deckId: 1 });
studyProgressSchema.index({ userId: 1, flashcardId: 1 });
studyProgressSchema.index({ userId: 1, masteryLevel: 1 });

export default mongoose.model("StudyProgress", studyProgressSchema);
