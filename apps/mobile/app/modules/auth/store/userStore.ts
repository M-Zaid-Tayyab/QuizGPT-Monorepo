import { mmkvPersist } from "@/app/storage/zustandMMKV";
import { create } from "zustand";

export type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  socialId?: string;
  socialType?: "google" | "apple";
  isSocialAuth?: boolean;
  token?: string;
  streak?: {
    current: number;
    longest: number;
    lastQuizDate?: string;
  };
  statistics?: {
    totalQuizzes: number;
    averageScore: number;
    totalCorrectAnswers: number;
    totalFlashcards: number;
    totalDecks: number;
    totalStudySessions: number;
    averageStudyTime: number;
    flashcardAccuracy: number;
  };
  age?: number;
  grade?: "School" | "College" | "University" | "Post-Graduate";
  biggestChallenge?:
    | "memory_retention"
    | "time_management"
    | "overwhelmed"
    | "focus_issues"
    | "exam_anxiety";
  studyMethod?:
    | "rereading"
    | "highlighting"
    | "practice_problems"
    | "study_groups"
    | "no_system";
  studyMaterials?:
    | "textbooks_pdfs"
    | "lecture_notes"
    | "research_papers"
    | "mixed_materials";
  studyTime?: "less_than_5" | "5_to_10" | "10_to_20" | "more_than_20";
  strugglingSubjects?:
    | "math_science"
    | "languages"
    | "history_social"
    | "all_subjects";
  examConfidence?:
    | "very_confident"
    | "somewhat_confident"
    | "not_confident"
    | "panic_mode";
  studyNeeds?:
    | "memory_techniques"
    | "faster_methods"
    | "study_structure"
    | "exam_practice"
    | "all_above";
  isProUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface UserState {
  user: User | null | any;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  onboardingCompleted: (isCompleted: boolean) => void;
  setUser: (user: Partial<User>) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  mmkvPersist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboardingCompleted: false,
      setUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
          isAuthenticated: true,
        })),

      onboardingCompleted: (isCompleted: boolean) =>
        set({ isOnboardingCompleted: isCompleted }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isOnboardingCompleted: false,
        }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: "user-storage" }
  )
);
