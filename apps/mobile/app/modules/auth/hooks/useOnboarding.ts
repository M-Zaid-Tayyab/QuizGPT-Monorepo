import colors from "@/app/constants/colors";
import { mmkv } from "@/app/storage/mmkv";
import { useUserStore } from "@/modules/auth/store/userStore";
import { useNavigation } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import useApis from "./useApis";

type NavigationProp = {
  reset: (params: { index: number; routes: { name: string }[] }) => void;
};

export interface Question {
  id: number;
  question: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  isTextInput?: boolean;
  placeholder?: string;
  keyboardType?: "numeric" | "default";
  maxLength?: number;
  options: {
    label: string;
    value: string;
    icon: string;
    color: string;
    description?: string;
  }[];
}

export const useOnboarding = () => {
  const navigation = useNavigation<NavigationProp>();
  const { onboardingCompleted, setUser } = useUserStore();
  const { registerMutation } = useApis();

  const [showWelcome, setShowWelcome] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const answers = useRef<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const progressBar = useSharedValue(0);
  const optionScales = useSharedValue([1, 1, 1, 1]);
  const optionOpacities = useSharedValue([1, 1, 1, 1]);
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const welcomeOpacity = useSharedValue(0);
  const welcomeScale = useSharedValue(0.8);
  const welcomeTranslateY = useSharedValue(50);
  const floatingIconY = useSharedValue(0);

  const questions: Question[] = [
    {
      id: 1,
      question: "How old are you?",
      subtitle: "This helps us create age-appropriate content",
      icon: "person-outline",
      iconColor: colors.primary,
      isTextInput: true,
      placeholder: "00",
      keyboardType: "numeric",
      maxLength: 2,
      options: [
        {
          label: "14-18 years",
          value: "14-18",
          icon: "school-outline",
          color: colors.warning,
        },
        {
          label: "19-25 years",
          value: "19-25",
          icon: "man-outline",
          color: colors.success,
        },
        {
          label: "25+ years",
          value: "25+",
          icon: "business-outline",
          color: colors.blue,
        },
      ],
    },
    {
      id: 2,
      question: "What's your gender?",
      subtitle:
        "We respect all identities and use this for personalized content",
      icon: "heart-outline",
      iconColor: colors.primary,
      options: [
        { label: "Male", value: "Male", icon: "male", color: colors.purple },
        {
          label: "Female",
          value: "Female",
          icon: "female",
          color: colors.primary,
        },
        {
          label: "Other",
          value: "Other",
          icon: "people-outline",
          color: colors.pink,
        },
      ],
    },
    {
      id: 3,
      question: "What's your education level?",
      subtitle: "This helps us match content to your learning stage",
      icon: "library-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "School",
          value: "School",
          icon: "school-outline",
          color: colors.lightPink,
        },
        {
          label: "College",
          value: "College",
          icon: "library-outline",
          color: colors.warning,
        },
        {
          label: "University",
          value: "University",
          icon: "school",
          color: colors.success,
        },
        {
          label: "Post-Graduate",
          value: "Post-Graduate",
          icon: "library",
          color: colors.blue,
        },
      ],
    },
    {
      id: 4,
      question: "What's your preferred challenge level?",
      subtitle: "Choose the difficulty that keeps you engaged",
      icon: "trending-up-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Easy",
          value: "Easy",
          icon: "leaf-outline",
          color: colors.success,
          description: "Start with basics",
        },
        {
          label: "Medium",
          value: "Medium",
          icon: "fitness-outline",
          color: colors.warning,
          description: "Balanced challenge",
        },
        {
          label: "Hard",
          value: "Hard",
          icon: "flash-outline",
          color: colors.primary,
          description: "Push your limits",
        },
      ],
    },
    {
      id: 5,
      question: "Where did you hear about us?",
      subtitle: "This helps us understand how users discover QuizGPT",
      icon: "share-social-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "TikTok",
          value: "tiktok",
          icon: "logo-tiktok",
          color: colors.black,
        },
        {
          label: "Instagram",
          value: "instagram",
          icon: "logo-instagram",
          color: colors.pink,
        },
        {
          label: "Play Store",
          value: "play_store",
          icon: "logo-google-playstore",
          color: colors.success,
        },
        {
          label: "Friend's whisper",
          value: "friend",
          icon: "people-outline",
          color: colors.blue,
        },
        {
          label: "Other",
          value: "other",
          icon: "question-mark-circle-outline",
          color: colors.black,
        },
      ],
    },
  ];

  useEffect(() => {
    const userUUID = Crypto.randomUUID();
    mmkv.set("userUUID", userUUID);
  }, []);

  useEffect(() => {
    if (showWelcome) {
      welcomeOpacity.value = withTiming(1, { duration: 800 });
      welcomeScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      welcomeTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      floatingIconY.value = withRepeat(
        withTiming(-20, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [showWelcome]);

  useEffect(() => {
    progressBar.value = withSpring(
      (currentQuestionIndex + 1) / questions.length,
      { damping: 15, stiffness: 100 }
    );
    cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    cardOpacity.value = withTiming(1, { duration: 300 });
    iconRotation.value = withSpring(360, { damping: 15, stiffness: 100 });
  }, [currentQuestionIndex]);

  const handleOnboarding = useCallback(() => {
    const payload = {
      uuid: mmkv.getString("userUUID"),
      age: parseInt(answers.current["1"]),
      gender: answers.current["2"],
      grade: answers.current["3"],
      difficulty: answers.current["4"],
      referral: answers.current["5"],
    };
    registerMutation.mutate(payload as any, {
      onSuccess: (response) => {
        onboardingCompleted(true);
        const user = {
          ...response.data.user,
          token: response.data.token,
        };
        setUser(user);
        navigation.reset({
          index: 0,
          routes: [{ name: "Paywall" }],
        });
      },
      onError: (error) => {
        if (error?.response?.data?.message === "UUID already registered") {
          const userUUID = Crypto.randomUUID();
          mmkv.set("userUUID", userUUID);
          handleOnboarding();
        }
      },
    });
  }, [onboardingCompleted, registerMutation, setUser, navigation]);

  const handleStartOnboarding = useCallback(() => {
    welcomeOpacity.value = withTiming(0, { duration: 400 });
    welcomeScale.value = withSpring(0.8, { damping: 15 });
    welcomeTranslateY.value = withSpring(-50, { damping: 15 });

    setTimeout(() => {
      setShowWelcome(false);
    }, 400);
  }, []);

  const resetOptionAnimations = useCallback(() => {
    optionScales.value = withSpring([1, 1, 1, 1], { damping: 15 });
    optionOpacities.value = withTiming([1, 1, 1, 1], { duration: 200 });
  }, []);

  const animateOptionSelection = useCallback((optionIndex: number) => {
    const newScales = [1, 1, 1, 1];
    const newOpacities = [0.6, 0.6, 0.6, 0.6];

    newScales[optionIndex] = 1.05;
    newOpacities[optionIndex] = 1;

    optionScales.value = withSpring(newScales, { damping: 15 });
    optionOpacities.value = withTiming(newOpacities, { duration: 200 });
  }, []);

  const handleAnswer = useCallback(
    async (answer: string, optionIndex: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setSelectedAnswer(answer);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      animateOptionSelection(optionIndex);

      answers.current = {
        ...answers.current,
        [questions[currentQuestionIndex].id]: answer,
      };

      cardScale.value = withSpring(0.95, { damping: 15 });
      cardOpacity.value = withTiming(1, { duration: 200 });

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          resetOptionAnimations();
        } else {
          handleOnboarding();
        }
        setIsAnimating(false);
      }, 1000);
    },
    [
      currentQuestionIndex,
      isAnimating,
      questions,
      resetOptionAnimations,
      animateOptionSelection,
      handleOnboarding,
    ]
  );

  const progressBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressBar.value * 100}%`,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [
      { scale: welcomeScale.value },
      { translateY: welcomeTranslateY.value },
    ],
  }));

  const floatingIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingIconY.value }],
  }));

  const option0AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: optionScales.value[0] }],
    opacity: optionOpacities.value[0],
  }));

  const option1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: optionScales.value[1] }],
    opacity: optionOpacities.value[1],
  }));

  const option2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: optionScales.value[2] }],
    opacity: optionOpacities.value[2],
  }));

  const option3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: optionScales.value[3] }],
    opacity: optionOpacities.value[3],
  }));

  const getOptionAnimatedStyle = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          return option0AnimatedStyle;
        case 1:
          return option1AnimatedStyle;
        case 2:
          return option2AnimatedStyle;
        case 3:
          return option3AnimatedStyle;
        default:
          return option0AnimatedStyle;
      }
    },
    [
      option0AnimatedStyle,
      option1AnimatedStyle,
      option2AnimatedStyle,
      option3AnimatedStyle,
    ]
  );

  return {
    showWelcome,
    currentQuestionIndex,
    selectedAnswer,
    isAnimating,
    questions,
    registerMutation,

    handleStartOnboarding,
    handleAnswer,

    progressBarAnimatedStyle,
    cardAnimatedStyle,
    iconAnimatedStyle,
    welcomeAnimatedStyle,
    floatingIconStyle,
    getOptionAnimatedStyle,
  };
};
