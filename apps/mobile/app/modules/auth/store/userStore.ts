import { mmkvPersist } from "@/app/storage/zustandMMKV";
import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  token?: string;
};

interface UserState {
  user: User | null | any;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  isProUser: boolean;
  setIsProUser: (isProUser: boolean) => void;
  onboardingCompleted: (isCompleted: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  quizCount: number;
  setQuizCount: (quizCount: number) => void;
  lastQuizDate: string;
  setLastQuizDate: (lastQuizDate: string) => void;
}

export const useUserStore = create<UserState>()(
  mmkvPersist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboardingCompleted: false,
      isProUser: false,
      quizCount: 0,
      lastQuizDate: "",
      setUser: (user) => set({ user, isAuthenticated: true }),

      setQuizCount: (quizCount: number) =>
        set((state) => ({
          quizCount: quizCount,
        })),

      setLastQuizDate: (lastQuizDate: string) => set({ lastQuizDate }),

      onboardingCompleted: (isCompleted: boolean) =>
        set({ isOnboardingCompleted: isCompleted }),

      setIsProUser: (isProUser: boolean) => set({ isProUser }),

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
