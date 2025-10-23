import colors from "@/app/constants/colors";
import { mmkv } from "@/app/storage/mmkv";
import { useUserStore } from "@/modules/auth/store/userStore";
import { useNavigation } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
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
  const optionScales = useSharedValue([1, 1, 1, 1, 1]);
  const optionOpacities = useSharedValue([1, 1, 1, 1, 1]);
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
      question: "What's your biggest study challenge?",
      subtitle: "Help us understand what's holding you back",
      icon: "alert-circle-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Can't find practice questions",
          value: "memory_retention",
          icon: "search-outline",
          color: colors.warning,
          description: "No relevant practice questions",
        },
        {
          label: "Don't know how to test myself",
          value: "time_management",
          icon: "help-circle-outline",
          color: colors.primary,
          description: "Struggling with self-assessment",
        },
        {
          label: "Too much content to study",
          value: "overwhelmed",
          icon: "trending-down-outline",
          color: colors.error,
          description: "Too much material to process",
        },
        {
          label: "Need exam-style questions",
          value: "focus_issues",
          icon: "school-outline",
          color: colors.blue,
          description: "Want exam-style practice",
        },
        {
          label: "Not sure what's important",
          value: "exam_anxiety",
          icon: "eye-off-outline",
          color: colors.pink,
          description: "Don't know what to focus on",
        },
      ],
    },
    {
      id: 2,
      question: "How do you currently prepare for exams?",
      subtitle: "Understanding your current study methods",
      icon: "book-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Search for questions online",
          value: "rereading",
          icon: "search-outline",
          color: colors.warning,
          description: "Hunting for relevant questions",
        },
        {
          label: "Use generic study apps",
          value: "highlighting",
          icon: "phone-portrait-outline",
          color: colors.blue,
          description: "One-size-fits-all content",
        },
        {
          label: "Just reread materials",
          value: "practice_problems",
          icon: "refresh-outline",
          color: colors.success,
          description: "Passive reading approach",
        },
        {
          label: "Study with friends",
          value: "study_groups",
          icon: "people-outline",
          color: colors.purple,
          description: "Collaborative learning",
        },
        {
          label: "Don't have a system",
          value: "no_system",
          icon: "help-circle-outline",
          color: colors.error,
          description: "Wing it and hope",
        },
      ],
    },
    {
      id: 3,
      question: "How confident do you feel before exams?",
      subtitle: "Understanding your exam anxiety levels",
      icon: "heart-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Very confident",
          value: "very_confident",
          icon: "checkmark-circle",
          color: colors.success,
          description: "I'm well prepared",
        },
        {
          label: "Somewhat confident",
          value: "somewhat_confident",
          icon: "thumbs-up-outline",
          color: colors.blue,
          description: "I'll probably do okay",
        },
        {
          label: "Not very confident",
          value: "not_confident",
          icon: "thumbs-down-outline",
          color: colors.warning,
          description: "I'm worried",
        },
        {
          label: "Panic mode",
          value: "panic_mode",
          icon: "alert-circle",
          color: colors.error,
          description: "I'm terrified",
        },
      ],
    },
    {
      id: 4,
      question: "What type of study materials do you use?",
      subtitle: "This helps us understand your study content",
      icon: "library-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Textbooks & PDFs",
          value: "textbooks_pdfs",
          icon: "book-outline",
          color: colors.lightPink,
          description: "Traditional study materials",
        },
        {
          label: "Lecture notes & slides",
          value: "lecture_notes",
          icon: "document-text-outline",
          color: colors.warning,
          description: "Class-based content",
        },
        {
          label: "Research papers",
          value: "research_papers",
          icon: "library-outline",
          color: colors.success,
          description: "Academic sources",
        },
        {
          label: "Mixed materials",
          value: "mixed_materials",
          icon: "grid-outline",
          color: colors.blue,
          description: "Various content types",
        },
      ],
    },
    {
      id: 5,
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
      id: 6,
      question: "What subjects do you struggle with most?",
      subtitle: "We'll create targeted content for your weak areas",
      icon: "school-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Math & Science",
          value: "math_science",
          icon: "calculator-outline",
          color: colors.blue,
          description: "Numbers and formulas",
        },
        {
          label: "Languages & Literature",
          value: "languages",
          icon: "book-outline",
          color: colors.purple,
          description: "Reading and writing",
        },
        {
          label: "History & Social Studies",
          value: "history_social",
          icon: "library-outline",
          color: colors.warning,
          description: "Memorization heavy",
        },
        {
          label: "All subjects",
          value: "all_subjects",
          icon: "grid-outline",
          color: colors.error,
          description: "Struggling across the board",
        },
      ],
    },
    {
      id: 7,
      question: "What would help you study better?",
      subtitle: "Tell us what you need most",
      icon: "bulb-outline",
      iconColor: colors.primary,
      options: [
        {
          label: "Exam-style practice questions",
          value: "exam_practice",
          icon: "school-outline",
          color: colors.success,
          description: "I want to know what the real test will be like",
        },
        {
          label: "Practice with my own materials",
          value: "memory_techniques",
          icon: "book-outline",
          color: colors.purple,
          description: "I want to practice with my notes and textbooks",
        },
        {
          label: "Know what's important to study",
          value: "study_structure",
          icon: "eye-outline",
          color: colors.blue,
          description: "I don't know what to focus on from all my materials",
        },
        {
          label: "Regular practice sessions",
          value: "faster_methods",
          icon: "refresh-outline",
          color: colors.primary,
          description: "I need to test myself consistently",
        },
        {
          label: "Questions that help me remember",
          value: "all_above",
          icon: "brain-outline",
          color: colors.warning,
          description: "I want effective practice that sticks",
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

    resetOptionAnimations();

    if (currentQuestionIndex === questions.length - 1) {
      requestStoreReview();
    }
  }, [currentQuestionIndex, resetOptionAnimations]);

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

  const handleOnboarding = useCallback(() => {
    const payload = {
      uuid: mmkv.getString("userUUID"),
      biggestChallenge: answers.current["1"],
      studyMethod: answers.current["2"],
      examConfidence: answers.current["3"],
      studyMaterials: answers.current["4"],
      age: parseInt(answers.current["5"]),
      strugglingSubjects: answers.current["6"],
      studyNeeds: answers.current["7"],
    };
    registerMutation.mutate(payload as any, {
      onSuccess: (response) => {
        onboardingCompleted(true);
        const user = {
          ...response.data.user,
          token: response.data.token,
          onboardingData: {
            biggestChallenge: answers.current["1"],
            studyMethod: answers.current["2"],
            examConfidence: answers.current["3"],
            studyMaterials: answers.current["4"],
            age: answers.current["5"],
            strugglingSubjects: answers.current["6"],
            studyNeeds: answers.current["7"],
          },
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
    optionScales.value = [1, 1, 1, 1, 1];
    optionOpacities.value = [1, 1, 1, 1, 1];
  }, []);

  const animateOptionSelection = useCallback(
    (optionIndex: number) => {
      const currentQuestion = questions[currentQuestionIndex];
      const optionCount = currentQuestion.options.length;

      const newScales = new Array(optionCount).fill(1);
      const newOpacities = new Array(optionCount).fill(0.6);

      newScales[optionIndex] = 1.05;
      newOpacities[optionIndex] = 1;

      optionScales.value = withSpring(newScales, { damping: 15 });
      optionOpacities.value = withTiming(newOpacities, { duration: 200 });
    },
    [currentQuestionIndex, questions]
  );

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

  const option4AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: optionScales.value[4] }],
    opacity: optionOpacities.value[4],
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
        case 4:
          return option4AnimatedStyle;
        default:
          return option0AnimatedStyle;
      }
    },
    [
      option0AnimatedStyle,
      option1AnimatedStyle,
      option2AnimatedStyle,
      option3AnimatedStyle,
      option4AnimatedStyle,
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
