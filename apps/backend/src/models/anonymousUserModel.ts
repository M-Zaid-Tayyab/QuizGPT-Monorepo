import mongoose from "mongoose";

const anonymousUserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
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
    },
    // Legacy fields (keeping for backward compatibility)
    age: {
      type: Number,
    },
    grade: {
      type: String,
      enum: ["School", "College", "University", "Post-Graduate"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },
    referral: {
      type: String,
      enum: ["tiktok", "instagram", "play_store", "friend", "other"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    // New pain point fields
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

export default mongoose.model("AnonymousUser", anonymousUserSchema);
