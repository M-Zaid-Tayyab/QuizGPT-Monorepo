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
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    userType: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    flashcards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flashcard",
      },
    ],
    studyCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

deckSchema.index({ createdBy: 1, category: 1 });
deckSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Deck", deckSchema);
