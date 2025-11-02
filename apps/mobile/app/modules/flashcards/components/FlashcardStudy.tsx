import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import ConfidenceRating from "./ConfidenceRating";
import FlashcardCardFlatList, {
  FlashcardCardFlatListRef,
} from "./FlashcardCardFlatList";
import FlashcardHeader from "./FlashcardHeader";
import RatingButtons from "./RatingButtons";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  currentIndex: number;
  onRate: (response: "again" | "hard" | "good" | "easy") => void;
  onNext: () => void;
  onPrevious: () => void;
  onIndexChange: (index: number) => void;
  showRating?: boolean;
}

type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  flashcards,
  currentIndex,
  onRate,
  onNext,
  onPrevious,
  onIndexChange,
  showRating = true,
}) => {
  const totalCards = flashcards.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === flashcards.length - 1;
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRatingState, setShowRatingState] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [confidenceLevel, setConfidenceLevel] =
    useState<ConfidenceLevel | null>(null);

  const flatListRef = useRef<FlashcardCardFlatListRef>(null);
  const ratingLockRef = useRef(false);

  const confidenceOpacity = useRef(new Animated.Value(0)).current;
  const confidenceTranslateY = useRef(new Animated.Value(12)).current;
  const ratingOpacity = useRef(new Animated.Value(0)).current;
  const ratingTranslateY = useRef(new Animated.Value(12)).current;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);

    if (!isFlipped) {
      if (showRating) {
        setShowConfidence(true);
        confidenceOpacity.setValue(0);
        confidenceTranslateY.setValue(12);
        Animated.parallel([
          Animated.timing(confidenceOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(confidenceTranslateY, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      setShowConfidence(false);
      setShowRatingState(false);
      setConfidenceLevel(null);
    }
  };

  const handleConfidenceSelect = (level: ConfidenceLevel) => {
    setConfidenceLevel(level);
    setShowConfidence(false);
    setShowRatingState(true);
    ratingOpacity.setValue(0);
    ratingTranslateY.setValue(12);
    Animated.parallel([
      Animated.timing(ratingOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(ratingTranslateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRate = (response: "again" | "hard" | "good" | "easy") => {
    if (ratingLockRef.current) return;
    ratingLockRef.current = true;

    if (response === "good" || response === "easy") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (response === "again") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.selectionAsync();
    }

    onRate(response);

    setShowRatingState(false);
    setShowConfidence(false);
    setConfidenceLevel(null);
    setIsFlipped(false);
    const ADVANCE_DELAY_MS = 200;
    if (!isLast) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToNext();
        } finally {
          ratingLockRef.current = false;
        }
      }, ADVANCE_DELAY_MS);
    } else {
      setTimeout(() => {
        onNext();
        ratingLockRef.current = false;
      }, ADVANCE_DELAY_MS);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowConfidence(false);
    setShowRatingState(false);
    setConfidenceLevel(null);
    flatListRef.current?.scrollToNext();
    onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setShowConfidence(false);
    setShowRatingState(false);
    setConfidenceLevel(null);
    flatListRef.current?.scrollToPrevious();
    onPrevious();
  };

  useEffect(() => {
    setIsFlipped(false);
    setShowConfidence(false);
    setShowRatingState(false);
    setConfidenceLevel(null);
  }, [currentIndex]);

  return (
    <View className="flex-1 bg-background py-safe">
      <FlashcardHeader
        currentIndex={currentIndex}
        totalCards={totalCards}
        isFirst={isFirst}
        isLast={isLast}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <View className="bg-greyBackground rounded-full h-1.5 mb-8 mx-4 mt-2">
        <View
          className="rounded-full h-1.5 bg-primary"
          style={{
            width: `${((currentIndex + 1) / totalCards) * 100}%`,
          }}
        />
      </View>

      <FlashcardCardFlatList
        ref={flatListRef}
        flashcards={flashcards}
        currentIndex={currentIndex}
        onIndexChange={onIndexChange}
        onFlip={handleFlip}
        isFlipped={isFlipped}
      />

      <Animated.View
        style={{
          opacity: confidenceOpacity,
          transform: [{ translateY: confidenceTranslateY }],
        }}
      >
        <ConfidenceRating
          showRating={showRating}
          showConfidence={showConfidence}
          confidenceLevel={confidenceLevel}
          onConfidenceSelect={handleConfidenceSelect}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: ratingOpacity,
          transform: [{ translateY: ratingTranslateY }],
        }}
      >
        <RatingButtons
          showRating={showRating}
          showRatingState={showRatingState}
          onRate={handleRate}
        />
      </Animated.View>
    </View>
  );
};

export default FlashcardStudy;
