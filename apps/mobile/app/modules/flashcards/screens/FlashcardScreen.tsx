import Header from "@/app/components/Header";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import { client } from "@/app/services";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
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
  const { deck: initialDeck } = route.params as { deck: Deck };
  const deckId = initialDeck._id;
  const { data: deckData, isLoading: isLoadingDeck } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      const response = await client.get(
        `flashcards/decks/${deckId}/flashcards`
      );
      return {
        deck: response.data.deck,
        flashcards: response.data.flashcards,
      };
    },
    enabled:
      !!deckId &&
      (!initialDeck.flashcards || initialDeck.flashcards.length === 0),
  });

  const deck = deckData?.deck || initialDeck;
  const [currentIndex, setCurrentIndex] = useState(0);

  const studyCards = (deck.flashcards || []) as Flashcard[];

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

  if (isLoadingDeck) {
    return (
      <View className="flex-1 bg-background pt-safe px-6">
        <View className="flex-row justify-between py-4">
          <SkeletonPlaceholder className="h-10 w-12 rounded-lg" />
          <SkeletonPlaceholder className="h-10 w-48 rounded-lg" />
          <SkeletonPlaceholder className="h-10 w-12 rounded-lg" />
        </View>
        <View className="flex-1 items-center justify-center">
          <SkeletonPlaceholder className="h-72 w-full rounded-2xl mb-4" />
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
      <FlashcardStudy
        flashcards={studyCards}
        currentIndex={currentIndex}
        onRate={handleRate}
        onIndexChange={setCurrentIndex}
        deckName={deck.name}
        onBackPress={handleExit}
        showRating={true}
      />
    </View>
  );
};

export default FlashcardScreen;
