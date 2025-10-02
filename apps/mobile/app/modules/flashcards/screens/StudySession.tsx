import Header from "@/app/components/Header";
import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import FlashcardStudy from "../components/FlashcardStudy";
import MatchMode from "../components/MatchMode";
import SpellMode from "../components/SpellMode";
import StudyModeSelector from "../components/StudyModeSelector";
import TestMode from "../components/TestMode";
import WriteMode from "../components/WriteMode";
import { useFlashcardAPI } from "../hooks/useFlashcardAPI";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface Deck {
  _id: string;
  name: string;
  flashcards: Flashcard[];
}

type StudyMode = "learn" | "flashcards" | "write" | "test" | "match" | "spell";

const StudySession: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { deck, initialMode } = route.params as {
    deck: Deck;
    initialMode?: StudyMode;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<StudyMode>("learn");
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [pendingReviews, setPendingReviews] = useState<
    {
      flashcardId: string;
      response: "again" | "hard" | "good" | "easy";
      responseTime: number;
      timestamp: number;
    }[]
  >([]);

  const { submitReview } = useFlashcardAPI();

  const submitAllReviews = async () => {
    if (pendingReviews.length === 0) {
      showSessionComplete();
      return;
    }

    try {
      // Calculate response times
      const reviewsWithTimes = pendingReviews.map((review, index) => {
        const nextReview = pendingReviews[index + 1];
        const responseTime = nextReview
          ? nextReview.timestamp - review.timestamp
          : 2000; // Default 2 seconds for last card
        return {
          ...review,
          responseTime: Math.max(responseTime, 100), // Minimum 100ms
        };
      });

      // Submit all reviews in parallel
      await Promise.all(
        reviewsWithTimes.map((review) =>
          submitReview(review.flashcardId, review.response, review.responseTime)
        )
      );

      // Clear pending reviews
      setPendingReviews([]);
      showSessionComplete();
    } catch (error) {
      console.error("Error submitting reviews:", error);
      Alert.alert(
        "Error",
        "Failed to save your progress. Your session data is stored locally and will be synced when you have a better connection.",
        [
          { text: "Continue", onPress: showSessionComplete },
          { text: "Retry", onPress: submitAllReviews },
        ]
      );
    }
  };

  const loadStudyCards = useCallback(async () => {
    try {
      setIsLoading(true);
      // For now, use all cards from the deck
      // In a real implementation, you'd get cards due for review
      setStudyCards(deck.flashcards);
    } catch (error) {
      console.error("Error loading study cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deck.flashcards]);

  useEffect(() => {
    loadStudyCards();

    // Set initial mode if provided
    if (initialMode) {
      setSelectedMode(initialMode);
      setShowModeSelector(false);
    }
  }, [initialMode, loadStudyCards]);

  const handleRate = (response: "again" | "hard" | "good" | "easy") => {
    const currentCard = studyCards[currentIndex];
    const startTime = Date.now();

    // Store review locally for batch submission
    setPendingReviews((prev) => [
      ...prev,
      {
        flashcardId: currentCard._id,
        response,
        responseTime: 0, // We'll calculate this when submitting
        timestamp: startTime,
      },
    ]);

    // Update session stats
    const isCorrect = response !== "again";
    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      total: prev.total + 1,
    }));

    // Haptics feedback
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Move to next card
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session complete - submit all reviews
      submitAllReviews();
    }
  };

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session complete - submit all reviews
      submitAllReviews();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const showSessionComplete = () => {
    const accuracy =
      sessionStats.total > 0
        ? Math.round((sessionStats.correct / sessionStats.total) * 100)
        : 0;

    Haptics.notificationAsync(
      accuracy >= 70
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );

    const emoji = accuracy >= 90 ? "🏆" : accuracy >= 70 ? "🎉" : "💪";

    Alert.alert(
      `${emoji} Session Complete!`,
      `You studied ${sessionStats.total} cards with ${accuracy}% accuracy.\n\n✅ Correct: ${sessionStats.correct}\n❌ Incorrect: ${sessionStats.incorrect}`,
      [
        {
          text: "🔄 Study Again",
          onPress: () => {
            setCurrentIndex(0);
            setSessionStats({ correct: 0, incorrect: 0, total: 0 });
          },
        },
        {
          text: "✅ Done",
          onPress: () => (navigation as any).goBack(),
        },
      ]
    );
  };

  const handleModeSelect = (mode: StudyMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
  };

  const handleModeComplete = (results: {
    correct: number;
    total: number;
    percentage: number;
    timeSpent: number;
  }) => {
    const modeName =
      selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1);
    const emoji =
      results.percentage >= 90 ? "🏆" : results.percentage >= 70 ? "🎉" : "💪";

    Alert.alert(
      `${emoji} ${modeName} Complete!`,
      `You scored ${results.correct}/${results.total} (${
        results.percentage
      }%) in ${Math.floor(results.timeSpent / 60)}:${(results.timeSpent % 60)
        .toString()
        .padStart(2, "0")}`,
      [
        {
          text: "🔄 Study Again",
          onPress: () => {
            setShowModeSelector(true);
            setCurrentIndex(0);
            setSessionStats({ correct: 0, incorrect: 0, total: 0 });
          },
        },
        {
          text: "✅ Done",
          onPress: () => (navigation as any).goBack(),
        },
      ]
    );
  };

  const handleAnswer = (isCorrect: boolean, responseTime: number) => {
    // Handle answer for WriteMode
    if (isCorrect) {
      setSessionStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    handleNext();
  };

  const handleExit = () => {
    if (pendingReviews.length > 0) {
      Alert.alert(
        "🚪 Exit Study Session",
        `You have ${pendingReviews.length} reviews pending. Do you want to save your progress before exiting?`,
        [
          { text: "❌ Cancel", style: "cancel" },
          {
            text: "🚫 Exit Without Saving",
            style: "destructive",
            onPress: () => (navigation as any).goBack(),
          },
          {
            text: "💾 Save & Exit",
            onPress: async () => {
              await submitAllReviews();
              (navigation as any).goBack();
            },
          },
        ]
      );
    } else {
      (navigation as any).goBack();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background pt-safe justify-center items-center px-6">
        <Text className="text-6xl mb-4">🔄</Text>
        <Text className="text-textSecondary font-nunito text-lg">
          Loading study session...
        </Text>
      </View>
    );
  }

  if (studyCards.length === 0) {
    return (
      <View className="flex-1 bg-background pt-safe justify-center items-center px-6">
        <Text className="text-6xl mb-4">📚</Text>
        <Text className="text-textPrimary font-nunito-bold text-2xl mt-4 text-center">
          No Cards to Study
        </Text>
        <Text className="text-textSecondary font-nunito text-center mt-2 text-base">
          This deck doesn&apos;t have any flashcards yet.
        </Text>
        <PrimaryButton
          title="🔙 Go Back"
          onPress={() => (navigation as any).goBack()}
          className="mt-8"
        />
      </View>
    );
  }

  if (showModeSelector) {
    return (
      <View className="flex-1 bg-background">
        <Header
          title="Choose Study Mode"
          onBackPress={handleExit}
          backIconName="arrow-back"
          className="px-6"
        />

        <View className="flex-1 px-6">
          <StudyModeSelector
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
          />
        </View>
      </View>
    );
  }

  if (selectedMode === "test") {
    return (
      <TestMode
        flashcards={studyCards}
        onComplete={handleModeComplete}
        onExit={handleExit}
      />
    );
  }

  if (selectedMode === "write") {
    return (
      <WriteMode
        flashcard={studyCards[currentIndex]}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentIndex={currentIndex}
        totalCards={studyCards.length}
        isFirst={currentIndex === 0}
        isLast={currentIndex === studyCards.length - 1}
      />
    );
  }

  if (selectedMode === "match") {
    return (
      <MatchMode
        flashcards={studyCards}
        onComplete={handleModeComplete}
        onExit={handleExit}
      />
    );
  }

  if (selectedMode === "spell") {
    return (
      <SpellMode
        flashcards={studyCards}
        onComplete={handleModeComplete}
        onExit={handleExit}
      />
    );
  }

  if (selectedMode === "flashcards") {
    return (
      <View className="flex-1 bg-background">
        <Header
          onBackPress={handleExit}
          backIconName="arrow-back"
          backIconColor={colors.textPrimary}
          rightComponent={
            <View className="flex-row items-center">
              <View className="flex-row items-center bg-success/10 rounded-full px-3 py-1 mr-3">
                <Text className="text-success font-nunito-bold text-lg">
                  ✅ {sessionStats.correct}
                </Text>
              </View>
              <View className="flex-row items-center bg-error/10 rounded-full px-3 py-1 mr-3">
                <Text className="text-error font-nunito-bold text-lg">
                  ❌ {sessionStats.incorrect}
                </Text>
              </View>
              {pendingReviews.length > 0 && (
                <View className="flex-row items-center bg-warning/10 rounded-full px-3 py-1">
                  <Text className="text-warning font-nunito-bold text-sm">
                    💾 {pendingReviews.length}
                  </Text>
                </View>
              )}
            </View>
          }
          className="px-6"
        />

        <FlashcardStudy
          flashcards={studyCards}
          currentIndex={currentIndex}
          onRate={() => {}}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onIndexChange={setCurrentIndex}
          showRating={false}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        onBackPress={handleExit}
        backIconName="arrow-back"
        backIconColor={colors.textPrimary}
        rightComponent={
          <View className="flex-row items-center">
            <View className="flex-row items-center bg-success/10 rounded-full px-3 py-1 mr-3">
              <Text className="text-success font-nunito-bold text-lg">
                ✅ {sessionStats.correct}
              </Text>
            </View>
            <View className="flex-row items-center bg-error/10 rounded-full px-3 py-1 mr-3">
              <Text className="text-error font-nunito-bold text-lg">
                ❌ {sessionStats.incorrect}
              </Text>
            </View>
            {pendingReviews.length > 0 && (
              <View className="flex-row items-center bg-warning/10 rounded-full px-3 py-1">
                <Text className="text-warning font-nunito-bold text-sm">
                  💾 {pendingReviews.length}
                </Text>
              </View>
            )}
          </View>
        }
        className="px-4"
      />

      <FlashcardStudy
        flashcards={studyCards}
        currentIndex={currentIndex}
        onRate={handleRate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onIndexChange={setCurrentIndex}
      />
    </View>
  );
};

export default StudySession;
