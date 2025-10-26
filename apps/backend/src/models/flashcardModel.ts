import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: true,
      maxlength: 500,
    },
    back: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    userType: {
      type: String,
      enum: ["user", "anonymous"],
      default: "anonymous",
    },
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
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    sourceMaterial: String,
    generatedFrom: {
      type: String,
      enum: ["pdf", "image", "text", "quiz"],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

flashcardSchema.index({ createdBy: 1, nextReview: 1 });
flashcardSchema.index({ createdBy: 1, category: 1 });
flashcardSchema.index({ createdBy: 1, userType: 1 });

export default mongoose.model("Flashcard", flashcardSchema);
