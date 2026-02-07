import { client } from "@/app/services";
import { useUserStore } from "@/modules/auth/store/userStore";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import useApis from "./useApis";
import { useOnboardingAnimations } from "./useOnboardingAnimations";
import { ONBOARDING_CONFIG } from "./useOnboardingConfig";

export interface OnboardingPreviewResult {
  quiz: { _id: string; title: string; questions: any[] };
  flashcard: {
    front: string;
    back: string;
    difficulty: string;
    category: string;
    tags?: string[];
  };
}

type NavigationProp = {
  reset: (params: { index: number; routes: { name: string }[] }) => void;
  navigate: (screen: string) => void;
};

export const useOnboarding = () => {
  const navigation = useNavigation<NavigationProp>();
  const { onboardingCompleted, user, setUser } = useUserStore();
  const { updateUserMutation } = useApis();

  const [showWelcome, setShowWelcome] = useState(true);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [showAhaScreen, setShowAhaScreen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const answers = useRef<Record<number, any>>({});
  const previewResultRef = useRef<OnboardingPreviewResult | null>(null);

  const {
    animationStyles,
    resetOptionAnimations,
    animateOptionSelection,
    animateWelcome,
    animateWelcomeExit,
    animateProgress,
    animateCardTransition,
    animateCardSelection,
  } = useOnboardingAnimations(ONBOARDING_CONFIG);

  const { questions } = ONBOARDING_CONFIG;

  useEffect(() => {
    if (showWelcome) {
      animateWelcome();
    }
  }, [showWelcome]);

  useEffect(() => {
    animateProgress(0, questions.length);
    animateCardTransition();
    resetOptionAnimations();
  }, []);

  const requestStoreReview = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.log("Store review request failed:", error);
    }
  };

  const createOnboardingPayload = useCallback(() => {
    const payload: Record<string, any> = {};

    const questionMapping: Record<number, string> = {
      1: "motivation",
      2: "studyConfidence",
      3: "studyChallenges",
      4: "studyFrequency",
      5: "mainGoal",
      6: "learningStyle",
      7: "studyMaterials",
      8: "difficultSubjects",
      9: "procrastinationLevel",
      10: "examTimeline",
      11: "activeRecallExperience",
      12: "spacedRepetitionExperience",
      13: "studyEnvironment",
      14: "focusDuration",
      15: "socialPreference",
      16: "toolsUsed",
      17: "motivationFactors",
      18: "appExpectations",
      19: "featureInterest",
      20: "age",
    };

    Object.entries(questionMapping).forEach(([questionId, payloadKey]) => {
      const answer = answers.current[parseInt(questionId)];
      if (answer !== undefined && answer !== null) {
        if (payloadKey === "age") {
          payload[payloadKey] = parseInt(answer as string);
        } else {
          payload[payloadKey] = answer;
        }
      }
    });

    return payload;
  }, []);

  /** Build payload for questions 1-8 only (for early prefetch after Q8). */
  const createPartialPayloadQ1toQ8 = useCallback(() => {
    const payload: Record<string, any> = {};
    const questionMapping: Record<number, string> = {
      1: "motivation",
      2: "studyConfidence",
      3: "studyChallenges",
      4: "studyFrequency",
      5: "mainGoal",
      6: "learningStyle",
      7: "studyMaterials",
      8: "difficultSubjects",
    };
    Object.entries(questionMapping).forEach(([questionId, payloadKey]) => {
      const answer = answers.current[parseInt(questionId)];
      if (answer !== undefined && answer !== null) {
        payload[payloadKey] = answer;
      }
    });
    return payload;
  }, []);

  const fetchOnboardingPreview = useCallback(
    async (
      payload: Record<string, any>
    ): Promise<OnboardingPreviewResult | null> => {
      try {
        const { data } = await client.post<OnboardingPreviewResult>(
          "onboarding/preview",
          payload
        );
        return data?.quiz && data?.flashcard ? data : null;
      } catch (err) {
        console.warn("Onboarding preview fetch failed:", err);
        return null;
      }
    },
    []
  );

  const handleOnboarding = useCallback(async () => {
    try {
      const onboardingData = createOnboardingPayload();

      const response = await updateUserMutation.mutateAsync(onboardingData);

      if (response.data.user) {
        setUser({
          ...user,
          ...response.data.user,
        });
      }

      onboardingCompleted(true);

      if (response.data.user?.isProUser) {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: "Paywall" }],
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      Toast.show({
        text1: "Setup Failed",
        text2: error?.response?.data?.message || "Something went wrong",
        type: "error",
      });
    }
  }, [
    createOnboardingPayload,
    onboardingCompleted,
    navigation,
    updateUserMutation,
    user,
    setUser,
  ]);

  const handleStartOnboarding = useCallback(() => {
    animateWelcomeExit();
    setTimeout(() => {
      setShowWelcome(false);
    }, 400);
  }, [animateWelcomeExit]);

  const nextStep = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      const nextQuestion = questions[nextIndex];
      let defaultAnswer = null;
      if (nextQuestion.type === "multiple" || nextQuestion.type === "chips") {
        defaultAnswer = [];
      } else if (nextQuestion.type === "slider") {
        defaultAnswer = null;
      }
      setCurrentAnswer(defaultAnswer);

      animateProgress(nextIndex, questions.length);
      animateCardTransition();
      resetOptionAnimations();

      // Prefetch Aha preview when user completes Q8 (we have answers 1-8 now)
      if (nextIndex === 8) {
        const partialPayload = createPartialPayloadQ1toQ8();
        if (Object.keys(partialPayload).length > 0) {
          fetchOnboardingPreview(partialPayload).then((result) => {
            if (result) previewResultRef.current = result;
          });
        }
      }
    } else {
      setShowAhaScreen(true);
    }
    setIsAnimating(false);
  }, [
    currentQuestionIndex,
    questions,
    animateProgress,
    animateCardTransition,
    resetOptionAnimations,
    createPartialPayloadQ1toQ8,
    fetchOnboardingPreview,
  ]);

  const onAhaComplete = useCallback(() => {
    setShowAhaScreen(false);
    setShowReviewScreen(true);
  }, []);

  const handleAnswer = useCallback(
    async (answer: string, optionIndex: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setCurrentAnswer(answer);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.options && currentQuestion.options.length > 0) {
        animateOptionSelection(optionIndex, currentQuestion.options.length);
      }

      answers.current = {
        ...answers.current,
        [currentQuestion.id]: answer,
      };

      animateCardSelection();

      setTimeout(async () => {
        nextStep();
      }, ONBOARDING_CONFIG.animationDurations.progress);
    },
    [
      currentQuestionIndex,
      isAnimating,
      questions,
      animateOptionSelection,
      animateCardSelection,
      nextStep,
    ]
  );

  const handleToggleAnswer = useCallback(
    async (value: string) => {
      const currentQuestion = questions[currentQuestionIndex];
      let newAnswer: string[] = Array.isArray(currentAnswer)
        ? [...currentAnswer]
        : [];

      if (newAnswer.includes(value)) {
        newAnswer = newAnswer.filter((a) => a !== value);
      } else {
        if (
          currentQuestion.maxSelections &&
          newAnswer.length >= currentQuestion.maxSelections
        ) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
          return;
        }
        newAnswer.push(value);
      }

      setCurrentAnswer(newAnswer);
      await Haptics.selectionAsync();
    },
    [currentAnswer, currentQuestionIndex, questions]
  );

  const handleNext = useCallback(
    async (value?: any) => {
      if (isAnimating) return;
      setIsAnimating(true);

      const valToSave = value !== undefined ? value : currentAnswer;

      answers.current = {
        ...answers.current,
        [questions[currentQuestionIndex].id]: valToSave,
      };

      animateCardSelection();

      setTimeout(async () => {
        nextStep();
      }, 300);
    },
    [
      currentAnswer,
      isAnimating,
      questions,
      currentQuestionIndex,
      animateCardSelection,
      nextStep,
    ]
  );

  return {
    showWelcome,
    currentQuestionIndex,
    currentAnswer,
    isAnimating,
    questions,

    handleStartOnboarding,
    handleAnswer,
    handleToggleAnswer,
    handleNext,

    handleOnboarding,
    showReviewScreen,
    showAhaScreen,
    onAhaComplete,
    previewResultRef,
    createOnboardingPayload,
    fetchOnboardingPreview,
    requestStoreReview,
    isUpdatingUser: updateUserMutation.isPending,

    ...animationStyles,
  };
};
