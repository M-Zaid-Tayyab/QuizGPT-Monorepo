import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    flashcards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flashcard",
      },
    ],
    // Anonymous user support
    createdBy: {
      type: String, // UUID for anonymous users
      required: true,
    },
    userType: {
      type: String,
      enum: ["user", "anonymous"],
      default: "anonymous",
    },
    // Deck settings
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Beginner", "Intermediate", "Advanced"],
      default: "Medium",
    },
    // Study statistics
    studyCount: {
      type: Number,
      default: 0,
    },
    lastStudied: {
      type: Date,
    },
    // Community features
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    // Deck preferences
    studyMode: {
      type: String,
      enum: ["spaced_repetition", "cram", "test", "match"],
      default: "spaced_repetition",
    },
    // AI Generation metadata
    sourceMaterial: String,
    generatedFrom: {
      type: String,
      enum: ["pdf", "image", "text", "quiz", "manual"],
    },
    // Deck organization
    folder: {
      type: String,
      default: "Default",
    },
    color: {
      type: String,
      default: "#FF6B6B", // Your primary color
    },
  },
  { timestamps: true }
);

// Indexes for performance
deckSchema.index({ createdBy: 1, userType: 1 });
deckSchema.index({ isPublic: 1, rating: -1 });
deckSchema.index({ createdBy: 1, folder: 1 });
deckSchema.index({ tags: 1 });

export default mongoose.model("Deck", deckSchema);
