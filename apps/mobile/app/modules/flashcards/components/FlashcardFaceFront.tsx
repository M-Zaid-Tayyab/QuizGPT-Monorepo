import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface FlashcardFaceFrontProps {
  flashcard: Flashcard;
  getDifficultyColor: (difficulty: string) => string;
}

const FlashcardFaceFront: React.FC<FlashcardFaceFrontProps> = ({
  flashcard,
  getDifficultyColor,
}) => {
  return (
    <View className="items-center flex-1 justify-center">
      <View className="flex-row items-center mb-6">
        <View
          className="px-3 py-1.5 rounded-full mr-3"
          style={{
            backgroundColor: getDifficultyColor(flashcard.difficulty) + "15",
          }}
        >
          <Text
            className="text-xs font-nunito-bold"
            style={{ color: getDifficultyColor(flashcard.difficulty) }}
          >
            {flashcard.difficulty}
          </Text>
        </View>
        <Text className="text-textSecondary font-nunito-medium text-sm">
          {flashcard.category}
        </Text>
      </View>

      <Text className="text-textPrimary text-2xl font-nunito-bold text-center leading-8 mb-8">
        {flashcard.front}
      </Text>

      <View className="items-center">
        <View className="rounded-full p-3 mb-2 bg-primary/10">
          <Ionicons
            name="arrow-down"
            size={20}
            color={colors.primary}
          />
        </View>
        <Text className="text-textSecondary font-nunito-medium text-sm text-center">
          Tap to reveal answer
        </Text>
      </View>
    </View>
  );
};

export default FlashcardFaceFront;
