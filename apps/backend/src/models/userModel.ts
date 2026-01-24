import mongoose, { Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  image?: string;
  socialId?: string;
  socialType?: "google" | "apple";
  isSocialAuth?: boolean;
  age?: number;
  grade?: "School" | "College" | "University" | "Post-Graduate";
  
  // New Onboarding Fields
  motivation?: string;
  studyConfidence?: number;
  studyChallenges?: string[];
  studyFrequency?: string;
  mainGoal?: string;
  learningStyle?: string[];
  studyMaterials?: string[];
  difficultSubjects?: string[];
  procrastinationLevel?: string;
  examTimeline?: string;
  activeRecallExperience?: string;
  spacedRepetitionExperience?: string;
  studyEnvironment?: string[];
  focusDuration?: number;
  socialPreference?: string;
  toolsUsed?: string[];
  motivationFactors?: string[];
  appExpectations?: string[];
  featureInterest?: string;
  commitmentLevel?: string;
  
  // Legacy or simplified fields mapped from new flow (optional, but keeping for compatibility if needed)
  biggestChallenge?: string;
  studyMethod?: string;
  strugglingSubjects?: string;
  examConfidence?: string;
  studyNeeds?: string;
  
  isProUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>(
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
    age: {
      type: Number,
    },
    grade: {
      type: String,
      enum: ["School", "College", "University", "Post-Graduate"],
    },
    
    // New Onboarding Fields
    motivation: { type: String },
    studyConfidence: { type: Number },
    studyChallenges: { type: [String] },
    studyFrequency: { type: String },
    mainGoal: { type: String },
    learningStyle: { type: [String] },
    studyMaterials: { type: [String] }, // Changed to array
    difficultSubjects: { type: [String] },
    procrastinationLevel: { type: String },
    examTimeline: { type: String },
    activeRecallExperience: { type: String },
    spacedRepetitionExperience: { type: String },
    studyEnvironment: { type: [String] },
    focusDuration: { type: Number },
    socialPreference: { type: String },
    toolsUsed: { type: [String] },
    motivationFactors: { type: [String] },
    appExpectations: { type: [String] },
    featureInterest: { type: String },
    commitmentLevel: { type: String },

    // Legacy fields (kept but relaxed constraints if needed, or just reusing names where they match)
    biggestChallenge: { type: String },
    studyMethod: { type: String },
    strugglingSubjects: { type: String }, // Can keep as String if storing primary one, or deprecated
    examConfidence: { type: String },
    studyNeeds: { type: String },

    isProUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserDocument>("User", userSchema);
