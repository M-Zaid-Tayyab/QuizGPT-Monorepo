import Header from "@/app/components/Header";
import colors from "@/app/constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import FlashcardStudy from "../components/FlashcardStudy";
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

const FlashcardScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { deck } = route.params as { deck: Deck };
  const { getDeckFlashcards } = useFlashcardAPI();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFlashcards = async () => {
      // Check if flashcards are populated (have front/back properties)
      // or just IDs (strings/ObjectIds)
      const hasPopulatedFlashcards =
        deck.flashcards &&
        deck.flashcards.length > 0 &&
        typeof deck.flashcards[0] === "object" &&
        "front" in deck.flashcards[0];

      if (hasPopulatedFlashcards) {
        // Flashcards are already populated, use them directly
        setStudyCards(deck.flashcards as Flashcard[]);
      } else {
        // Need to fetch the full deck with populated flashcards
        setIsLoading(true);
        try {
          const response = await getDeckFlashcards(deck._id);
          if (response?.flashcards) {
            setStudyCards(response.flashcards as Flashcard[]);
          }
        } catch (error) {
          console.error("Error loading flashcards:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFlashcards();
  }, [deck._id, deck.flashcards, getDeckFlashcards]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate back when finished
      navigation.goBack();
    }
  }, [currentIndex, studyCards.length, navigation]);

  const handleRate = useCallback(
    (response: "again" | "hard" | "good" | "easy") => {
      // Handle rating if needed in the future
      // Note: Navigation is handled by FlashcardStudy component via scrollToNext
      // which triggers onViewableItemsChanged -> onIndexChange
      // So we don't increment the index here to avoid double increment
    },
    []
  );

  const handleExit = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Header onBackPress={handleExit} title={deck.name} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-textSecondary font-nunito text-center">
            Loading flashcards...
          </Text>
        </View>
      </View>
    );
  }

  if (studyCards.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <Header onBackPress={handleExit} title={deck.name} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-textSecondary font-nunito text-center">
            No flashcards available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        onBackPress={handleExit}
        backIconColor={colors.textPrimary}
        title={deck.name}
      />
      <FlashcardStudy
        flashcards={studyCards}
        currentIndex={currentIndex}
        onRate={handleRate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onIndexChange={setCurrentIndex}
        showRating={true}
      />
    </View>
  );
};

export default FlashcardScreen;
