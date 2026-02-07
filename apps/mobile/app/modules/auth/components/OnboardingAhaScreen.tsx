import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import BottomSheet from "@gorhom/bottom-sheet";
import { clsx } from "clsx";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Easing,
  Animated as RNAnimated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  Easing as ReEasing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import FlashcardFaceBack from "../../flashcards/components/FlashcardFaceBack";
import FlashcardFaceFront from "../../flashcards/components/FlashcardFaceFront";
import useQuiz from "../../home/hooks/useQuiz";
import ExplanationButton from "../../quiz/components/ExplanationButton";
import ExplanationSheet from "../../quiz/components/ExplanationSheet";
import QuizOption from "../../quiz/components/QuizOption";
import type { OnboardingPreviewResult } from "../hooks/useOnboarding";

type TabType = "quiz" | "flashcard";

interface OnboardingAhaScreenProps {
  cachedPreview: OnboardingPreviewResult | null;
  onComplete: () => void;
  fetchPreview: (
    payload: Record<string, any>,
  ) => Promise<OnboardingPreviewResult | null>;
  fullPayload: Record<string, any>;
}

const { width } = Dimensions.get("window");
const cardWidth = Math.max(260, Math.min(width - 32, 380));
const cardHeight = Math.round(cardWidth * 0.75);

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return colors.success;
    case "Medium":
      return colors.warning;
    case "Hard":
      return colors.error;
    default:
      return colors.primary;
  }
};

const DEMO_EXPLANATION =
  "Photosynthesis is the process plants use to convert sunlight into chemical energy. They take in carbon dioxide and water, and produce glucose and oxygen.";

const DEMO_PREVIEW: OnboardingPreviewResult = {
  quiz: {
    _id: "demo",
    title: "Quick Preview",
    questions: [
      {
        question:
          "Which process converts sunlight into chemical energy in plants?",
        questionType: "mcq",
        options: [
          "Photosynthesis",
          "Respiration",
          "Transpiration",
          "Fermentation",
        ],
        correctAnswer: 0,
      },
    ],
  },
  flashcard: {
    front: "What is active recall?",
    back: "A study method where you retrieve information from memory instead of re-reading, which strengthens long-term retention.",
    difficulty: "Medium",
    category: "Study Skills",
    tags: ["study", "memory"],
  },
};

const OnboardingAhaScreen: React.FC<OnboardingAhaScreenProps> = ({
  cachedPreview,
  onComplete,
  fetchPreview,
  fullPayload,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("quiz");
  const [preview, setPreview] = useState<OnboardingPreviewResult | null>(
    cachedPreview,
  );
  const [isLoading, setIsLoading] = useState(!cachedPreview);
  const [isDemo, setIsDemo] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [tabWidth, setTabWidth] = useState(0);

  const explanationSheetRef = useRef<BottomSheet>(null);
  const flipAnimation = useRef(new RNAnimated.Value(0)).current;
  const tabTranslateX = useSharedValue(0);
  const floatY = useSharedValue(0);

  const { explanationMutation } = useQuiz();

  useEffect(() => {
    if (cachedPreview) {
      setPreview(cachedPreview);
      setIsDemo(false);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    fetchPreview(fullPayload)
      .then((result) => {
        if (!cancelled && result) {
          setPreview(result);
          setIsDemo(false);
        } else if (!cancelled) {
          setPreview(DEMO_PREVIEW);
          setIsDemo(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(DEMO_PREVIEW);
          setIsDemo(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cachedPreview, fullPayload, fetchPreview]);

  useEffect(() => {
    RNAnimated.timing(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnimation]);

  useEffect(() => {
    if (tabWidth > 0) {
      tabTranslateX.value = withTiming(activeTab === "quiz" ? 0 : tabWidth, {
        duration: 240,
        easing: ReEasing.out(ReEasing.cubic),
      });
    }
  }, [activeTab, tabWidth, tabTranslateX]);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(6, {
        duration: 1600,
        easing: ReEasing.inOut(ReEasing.quad),
      }),
      -1,
      true,
    );
  }, [floatY]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const cardTransformFront = useMemo(
    () => [{ perspective: 1000 }, { rotateY: frontInterpolate }],
    [frontInterpolate],
  );
  const cardTransformBack = useMemo(
    () => [{ perspective: 1000 }, { rotateY: backInterpolate }],
    [backInterpolate],
  );
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabTranslateX.value }],
    width: tabWidth,
  }));
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const question = preview?.quiz?.questions?.[0];
  const quizId = preview?.quiz?._id;
  const correctAnswerIndex =
    question != null && typeof question.correctAnswer === "number"
      ? question.correctAnswer
      : question
        ? parseInt(String(question.correctAnswer), 10)
        : 0;
  const canContinue = activeTab === "quiz" ? isAnswerSubmitted : isFlipped;

  const handleOpenExplanation = () => {
    if (!quizId || selectedAnswer === null) return;
    setExplanation(null);
    setExplanationError(null);
    explanationSheetRef.current?.expand();
    if (isDemo) {
      setExplanation(DEMO_EXPLANATION);
      return;
    }
    explanationMutation.mutate(
      {
        quizId,
        questionIndex: 0,
        correctAnswerIndex,
        selectedAnswerIndex: selectedAnswer,
      },
      {
        onSuccess: (response: any) => {
          setExplanation(response?.data?.explanation ?? null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: () => {
          setExplanationError("Could not load explanation");
        },
      },
    );
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
    setIsAnswerSubmitted(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    Haptics.selectionAsync();
  };

  if (isLoading) {
    return (
      <View className={clsx("flex-1 justify-center items-center px-6")}>
        <Text className={clsx("text-textSecondary text-base font-nunito mb-4")}>
          Preparing your preview...
        </Text>
      </View>
    );
  }

  if (!preview) {
    return (
      <View className={clsx("flex-1 justify-center items-center px-6")}>
        <Text
          className={clsx("text-textSecondary text-center font-nunito mb-4")}
        >
          Preview not available
        </Text>
        <PrimaryButton title="Continue" onPress={onComplete} />
      </View>
    );
  }

  return (
    <View className={clsx("flex-1 px-5")}>
      <Animated.View entering={FadeInDown.duration(220)}>
        <Text
          className={clsx(
            "text-textPrimary text-xl font-nunito-bold mt-2 text-center",
          )}
        >
          Try QuizGPT
        </Text>
        <Text
          className={clsx(
            "text-textSecondary text-sm font-nunito text-center mt-0.5 mb-5",
          )}
        >
          See how it works
        </Text>

        <View
          className={clsx(
            "relative flex-row rounded-full bg-gray-100 p-1 mb-6",
          )}
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            const innerWidth = Math.max(0, width - 8);
            setTabWidth(innerWidth / 2);
          }}
        >
          <Animated.View
            pointerEvents="none"
            className={clsx(
              "absolute top-1 bottom-1 left-1 rounded-full bg-primary",
            )}
            style={tabIndicatorStyle}
          />
          <TouchableOpacity
            className={clsx(
              "flex-1 py-2.5 rounded-full items-center justify-center bg-transparent",
            )}
            onPress={() => setActiveTab("quiz")}
          >
            <Text
              className={clsx(
                "text-center font-nunito-semibold text-base",
                activeTab === "quiz" ? "text-white" : "text-textSecondary",
              )}
            >
              Quiz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={clsx(
              "flex-1 py-2.5 rounded-full items-center justify-center bg-transparent",
            )}
            onPress={() => setActiveTab("flashcard")}
          >
            <Text
              className={clsx(
                "text-center font-nunito-semibold text-base",
                activeTab === "flashcard" ? "text-white" : "text-textSecondary",
              )}
            >
              Flashcard
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {activeTab === "quiz" && question && (
        <Animated.View
          entering={FadeInUp.duration(220)}
          exiting={FadeOutDown.duration(160)}
          className={clsx("flex-1 min-h-[200px] mt-8")}
        >
          <Text
            className={clsx(
              "text-lg font-nunito-bold text-textPrimary mb-4 leading-snug",
            )}
          >
            {question.question}
          </Text>
          <View className={clsx("mt-4")}>
            {(question.options || []).map((option: string, index: number) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 40).duration(200)}
                className={clsx("mb-1")}
              >
                <QuizOption
                  option={option}
                  index={index}
                  isCurrentQuestion={true}
                  isSelected={selectedAnswer === index}
                  isCorrect={correctAnswerIndex === index}
                  isAnswerSubmitted={isAnswerSubmitted}
                  isHistory={false}
                  isSkipped={false}
                  animatedStyle={{}}
                  onPress={handleAnswerSelect}
                />
              </Animated.View>
            ))}
          </View>
          {isAnswerSubmitted && (
            <>
              <ExplanationButton
                onPress={handleOpenExplanation}
                disabled={explanationMutation.isPending}
              />
            </>
          )}
        </Animated.View>
      )}

      {activeTab === "flashcard" && preview.flashcard && (
        <Animated.View
          entering={FadeInUp.duration(220)}
          exiting={FadeOutDown.duration(160)}
          className={clsx("flex-1 items-center min-h-[280px] justify-center")}
        >
          <Animated.View style={floatStyle}>
            <TouchableOpacity
              onPress={handleFlip}
              style={{ width: cardWidth, height: cardHeight }}
              activeOpacity={0.9}
            >
              <View style={{ width: cardWidth, height: cardHeight }}>
                <RNAnimated.View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    transform: cardTransformFront as any,
                    backfaceVisibility: "hidden",
                    shadowColor: colors.shadow,
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
                  }}
                  className={clsx("bg-white rounded-2xl p-6 justify-center")}
                >
                  <FlashcardFaceFront
                    flashcard={{
                      _id: "preview",
                      ...preview.flashcard,
                      tags: preview.flashcard.tags || [],
                    }}
                    getDifficultyColor={getDifficultyColor}
                  />
                </RNAnimated.View>
                <RNAnimated.View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    transform: cardTransformBack as any,
                    backfaceVisibility: "hidden",
                    shadowColor: colors.shadow,
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
                  }}
                  className={clsx("bg-white rounded-2xl p-6 justify-center")}
                >
                  <FlashcardFaceBack
                    flashcard={{
                      _id: "preview",
                      ...preview.flashcard,
                      tags: preview.flashcard.tags || [],
                    }}
                    getDifficultyColor={getDifficultyColor}
                  />
                </RNAnimated.View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      <View className={clsx("mt-6 mb-2 flex-row items-center gap-3")}>
        <PrimaryButton
          title="Continue"
          onPress={onComplete}
          disabled={!canContinue}
          className={clsx("flex-1")}
        />
      </View>

      <ExplanationSheet
        bottomSheetRef={explanationSheetRef}
        isLoading={explanationMutation.isPending}
        error={explanationError}
        explanation={explanation}
      />
    </View>
  );
};

export default OnboardingAhaScreen;
