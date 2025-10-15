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
    // Anonymous user support
    createdBy: {
      type: String, // UUID instead of ObjectId for anonymous users
      required: true,
    },
    userType: {
      type: String,
      enum: ["user", "anonymous"],
      default: "anonymous",
    },
    // Spaced Repetition Algorithm Fields (SuperMemo)
    interval: {
      type: Number,
      default: 1, // days
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    ease: {
      type: Number,
      default: 2.5, // SuperMemo algorithm default
    },
    lastReviewed: {
      type: Date,
      default: Date.now,
    },
    nextReview: {
      type: Date,
      default: Date.now,
    },
    // Study Statistics
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    // AI Generation Metadata
    sourceMaterial: String,
    generatedFrom: {
      type: String,
      enum: ["pdf", "image", "text", "quiz"],
    },
    // Quality and validation
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

// Indexes for performance
flashcardSchema.index({ createdBy: 1, nextReview: 1 });
flashcardSchema.index({ createdBy: 1, category: 1 });
flashcardSchema.index({ createdBy: 1, userType: 1 });

export default mongoose.model("Flashcard", flashcardSchema);


