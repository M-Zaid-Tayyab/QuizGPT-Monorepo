import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastQuizDate: Date,
    },
    statistics: {
      totalQuizzes: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      totalCorrectAnswers: {
        type: Number,
        default: 0,
      },
      // Flashcard statistics
      totalFlashcards: {
        type: Number,
        default: 0,
      },
      totalDecks: {
        type: Number,
        default: 0,
      },
      totalStudySessions: {
        type: Number,
        default: 0,
      },
      averageStudyTime: {
        type: Number,
        default: 0,
      },
      flashcardAccuracy: {
        type: Number,
        default: 0,
      },
    },
    age: {
      type: String,
      enum: ["8-12", "13-18", "19-25", "25+"],
    },
    grade: {
      type: String,
      enum: ["Elementary", "Middle School", "High School", "College"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
