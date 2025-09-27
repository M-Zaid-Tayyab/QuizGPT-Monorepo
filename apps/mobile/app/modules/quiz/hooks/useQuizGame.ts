import { sound } from "@/assets/sound";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import useQuiz from "../../home/hooks/useQuiz";

export interface QuizQuestion {
  question: string;
  questionType: "mcq" | "true_false" | "fill_blank";
  options: string[];
  correctAnswer: string | number;
  selectedAnswer?: number;
  userAnswer?: string; // For fill-in-the-blank questions
}

export interface QuizData {
  _id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export const useQuizGame = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizResultMutation, moreQuestionsMutation } = useQuiz();

  const routeParams = route.params as any;
  const initialQuizData: QuizData = routeParams?.quizData;
  const isHistory = routeParams?.isHistory || false;
  const [quizData, setQuizData] = useState<QuizData | null>(
    initialQuizData || null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const selectedAnswers = useRef<any[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showSkipMessage, setShowSkipMessage] = useState(false);

  const correctAudioPlayer = useAudioPlayer(sound.correct);
  const wrongAudioPlayer = useAudioPlayer(sound.wrong);

  const progressBar = useSharedValue(0);
  const optionScales = useSharedValue([1, 1, 1, 1]);
  const optionOpacities = useSharedValue([1, 1, 1, 1]);
  const questionSlide = useSharedValue(0);

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];

  useEffect(() => {
    questionSlide.value = 0;
  }, []);

  useEffect(() => {
    if (quizData?.questions) {
      progressBar.value = withSpring(
        (currentQuestionIndex + 1) / (quizData.questions?.length || 1),
        { damping: 15, stiffness: 100 }
      );
    }
  }, [currentQuestionIndex, quizData?.questions?.length]);

  useEffect(() => {
    if (containerWidth > 0) {
      questionSlide.value = withTiming(currentQuestionIndex, {
        duration: 300,
      });
    }
  }, [currentQuestionIndex, containerWidth]);

  useEffect(() => {
    if (showSkipMessage) {
      const timer = setTimeout(() => {
        setShowSkipMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSkipMessage]);

  const resetOptionAnimations = useCallback(() => {
    optionScales.value = withSpring([1, 1, 1, 1], { damping: 15 });
    optionOpacities.value = withTiming([1, 1, 1, 1], { duration: 200 });
  }, [optionScales, optionOpacities]);

  const onContinueLearning = useCallback(
    (userPrompt: string) => {
      moreQuestionsMutation.mutate(
        {
          quizId: quizData?._id,
          userPrompt: userPrompt,
        },
        {
          onSuccess: (resp) => {
            setQuizData(resp?.data?.quiz);
            setShowResults(false);
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
            setCurrentQuestionIndex((prev) => prev + 1);
            resetOptionAnimations();
          },
        }
      );
    },
    [moreQuestionsMutation, quizData?._id, resetOptionAnimations]
  );

  const handleAnswerSelect = useCallback(
    async (index: number) => {
      if (isAnswerSubmitted || isHistory || isAnimating || !currentQuestion)
        return;

      setIsAnimating(true);
      setSelectedAnswer(index);
      setIsAnswerSubmitted(true);
      selectedAnswers.current.push({
        questionIndex: currentQuestionIndex,
        selectedAnswer: index,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isCorrect =
        index ===
        (typeof currentQuestion.correctAnswer === "number"
          ? currentQuestion.correctAnswer
          : parseInt(currentQuestion.correctAnswer, 10));
      if (isCorrect) {
        setScore(score + 1);
        try {
          correctAudioPlayer.seekTo(0);
          correctAudioPlayer.play();
        } catch (error) {
          console.log("Error playing correct sound:", error);
        }
      } else {
        try {
          wrongAudioPlayer.seekTo(0);
          wrongAudioPlayer.play();
        } catch (error) {
          console.log("Error playing wrong sound:", error);
        }
      }

      const newScales = [1, 1, 1, 1];
      const newOpacities = [0.6, 0.6, 0.6, 0.6];

      newScales[index] = 1;
      newOpacities[index] = 1;

      const correctAnswerIndex =
        typeof currentQuestion.correctAnswer === "number"
          ? currentQuestion.correctAnswer
          : parseInt(currentQuestion.correctAnswer, 10);
      newOpacities[correctAnswerIndex] = 1;

      optionScales.value = withSpring(newScales, { damping: 15 });
      optionOpacities.value = withTiming(newOpacities, { duration: 200 });

      setTimeout(() => {
        setIsAnimating(false);
      }, 800);
    },
    [
      isAnswerSubmitted,
      isHistory,
      isAnimating,
      currentQuestion?.correctAnswer,
      score,
      correctAudioPlayer,
      wrongAudioPlayer,
    ]
  );

  const handleNextQuestion = useCallback(() => {
    if (
      !isAnswerSubmitted &&
      !isHistory &&
      !skippedQuestions.has(currentQuestionIndex)
    )
      return;

    if (currentQuestionIndex < (quizData?.questions?.length || 0) - 1) {
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetOptionAnimations();
    } else {
      if (!isHistory) {
        quizResultMutation.mutate({
          quizId: quizData?._id,
          questions: selectedAnswers.current,
        });
      }
      setShowResults(true);
    }
  }, [
    isAnswerSubmitted,
    isHistory,
    skippedQuestions,
    currentQuestionIndex,
    quizData,
    resetOptionAnimations,
    quizResultMutation,
  ]);

  const handleGoHome = useCallback(() => {
    if (isHistory) {
      (navigation as any).navigate("Main", { screen: "History" });
    } else {
      (navigation as any).navigate("Main", { screen: "Home" });
    }
  }, [isHistory, navigation]);

  const handleReport = useCallback(
    (text: string) => {
      setSkippedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
      setShowSkipMessage(true);

      if (currentQuestionIndex < (quizData?.questions?.length || 0) - 1) {
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetOptionAnimations();
      } else {
        if (!isHistory) {
          quizResultMutation.mutate({
            quizId: quizData?._id,
            questions: selectedAnswers.current,
          });
        }
        setShowResults(true);
      }
    },
    [
      currentQuestionIndex,
      quizData,
      resetOptionAnimations,
      quizResultMutation,
      isHistory,
    ]
  );

  const historyScore = isHistory
    ? quizData?.questions?.reduce((acc: number, q: any, index: number) => {
        if (skippedQuestions.has(index)) return acc;

        return typeof q.selectedAnswer !== "undefined" &&
          (typeof q.correctAnswer === "number"
            ? q.correctAnswer
            : parseInt(q.correctAnswer, 10)) === q.selectedAnswer
          ? acc + 1
          : acc;
      }, 0) || 0
    : score;

  const progressBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressBar.value * 100}%`,
  }));

  const questionAnimatedStyle = useAnimatedStyle(() => {
    if (!containerWidth || !quizData?.questions?.length) {
      return { transform: [{ translateX: 0 }] };
    }

    const translateX = -containerWidth * questionSlide.value;

    return {
      transform: [{ translateX }],
    };
  });

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
    quizData,
    isHistory,
    currentQuestion,
    currentQuestionIndex,

    selectedAnswer,
    isAnswerSubmitted,
    showResults,
    isAnimating,
    containerWidth,
    skippedQuestions,
    showSkipMessage,
    historyScore,

    handleAnswerSelect,
    handleNextQuestion,
    handleGoHome,
    handleReport,
    setContainerWidth,
    progressBarAnimatedStyle,
    questionAnimatedStyle,
    getOptionAnimatedStyle,
    onContinueLearning,
    moreQuestionsMutation,
  };
};
