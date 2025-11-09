import Header from "@/app/components/Header";
import colors from "@/app/constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import FlashcardStudy from "../components/FlashcardStudy";

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

  const [currentIndex, setCurrentIndex] = useState(0);

  const studyCards = (deck.flashcards || []) as Flashcard[];

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
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
