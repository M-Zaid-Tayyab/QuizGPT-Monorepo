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
    socialId: {
      type: String,
    },
    socialType: {
      type: String,
      enum: ["google", "apple"],
    },
    isSocialAuth: {
      type: Boolean,
      default: false,
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
      type: Number,
    },
    grade: {
      type: String,
      enum: ["School", "College", "University", "Post-Graduate"],
    },
    biggestChallenge: {
      type: String,
      enum: [
        "memory_retention",
        "time_management",
        "overwhelmed",
        "focus_issues",
        "exam_anxiety",
      ],
    },
    studyMethod: {
      type: String,
      enum: [
        "rereading",
        "highlighting",
        "practice_problems",
        "study_groups",
        "no_system",
      ],
    },
    studyMaterials: {
      type: String,
      enum: [
        "textbooks_pdfs",
        "lecture_notes",
        "research_papers",
        "mixed_materials",
      ],
    },
    studyTime: {
      type: String,
      enum: ["less_than_5", "5_to_10", "10_to_20", "more_than_20"],
    },
    strugglingSubjects: {
      type: String,
      enum: ["math_science", "languages", "history_social", "all_subjects"],
    },
    examConfidence: {
      type: String,
      enum: [
        "very_confident",
        "somewhat_confident",
        "not_confident",
        "panic_mode",
      ],
    },
    studyNeeds: {
      type: String,
      enum: [
        "memory_techniques",
        "faster_methods",
        "study_structure",
        "exam_practice",
        "all_above",
      ],
    },
    isProUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
