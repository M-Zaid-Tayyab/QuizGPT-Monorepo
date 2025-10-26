import { useUserStore } from "@/modules/auth/store/userStore";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import useApis from "./useApis";
import { useOnboardingAnimations } from "./useOnboardingAnimations";
import { ONBOARDING_CONFIG } from "./useOnboardingConfig";

type NavigationProp = {
  reset: (params: { index: number; routes: { name: string }[] }) => void;
  navigate: (screen: string) => void;
};

export const useOnboarding = () => {
  const navigation = useNavigation<NavigationProp>();
  const { onboardingCompleted, user, setUser } = useUserStore();
  const { updateUserMutation } = useApis();

  const [showWelcome, setShowWelcome] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasRequestedReview, setHasRequestedReview] = useState(false);

  const answers = useRef<Record<number, string>>({});

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
  }, [showWelcome, animateWelcome]);

  useEffect(() => {
    animateProgress(currentQuestionIndex, questions.length);
    animateCardTransition();
    resetOptionAnimations();

    if (currentQuestionIndex === 3 && !hasRequestedReview) {
      requestStoreReview();
      setHasRequestedReview(true);
    }
  }, [
    currentQuestionIndex,
    animateProgress,
    animateCardTransition,
    resetOptionAnimations,
    questions.length,
    hasRequestedReview,
  ]);

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
      1: "biggestChallenge",
      2: "studyMethod",
      3: "examConfidence",
      4: "studyMaterials",
      5: "age",
      6: "strugglingSubjects",
      7: "studyNeeds",
    };

    Object.entries(questionMapping).forEach(([questionId, payloadKey]) => {
      const answer = answers.current[parseInt(questionId)];
      if (answer) {
        payload[payloadKey] = questionId === "5" ? parseInt(answer) : answer;
      }
    });

    return payload;
  }, []);

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

  const handleAnswer = useCallback(
    async (answer: string, optionIndex: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setSelectedAnswer(answer);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const currentQuestion = questions[currentQuestionIndex];
      animateOptionSelection(optionIndex, currentQuestion.options.length);

      answers.current = {
        ...answers.current,
        [currentQuestion.id]: answer,
      };

      animateCardSelection();

      setTimeout(async () => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
        } else {
          await handleOnboarding();
        }
        setIsAnimating(false);
      }, ONBOARDING_CONFIG.animationDurations.progress);
    },
    [
      currentQuestionIndex,
      isAnimating,
      questions,
      animateOptionSelection,
      animateCardSelection,
      handleOnboarding,
    ]
  );

  return {
    showWelcome,
    currentQuestionIndex,
    selectedAnswer,
    isAnimating,
    questions,

    handleStartOnboarding,
    handleAnswer,
    isUpdatingUser: updateUserMutation.isPending,

    ...animationStyles,
  };
};
