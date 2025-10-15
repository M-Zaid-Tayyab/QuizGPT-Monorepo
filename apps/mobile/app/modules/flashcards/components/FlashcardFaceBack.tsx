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

interface FlashcardFaceBackProps {
  flashcard: Flashcard;
  getDifficultyColor: (difficulty: string) => string;
}

const FlashcardFaceBack: React.FC<FlashcardFaceBackProps> = ({
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

      <Text className="text-textPrimary text-xl font-nunito text-center leading-7 mb-6">
        {flashcard.back}
      </Text>

      {flashcard.tags.length > 0 && (
        <View className="flex-row flex-wrap justify-center gap-2">
          {flashcard.tags.map((tag, tagIndex) => (
            <View
              key={tagIndex}
              className="bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Text className="text-primary font-nunito-medium text-xs">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default FlashcardFaceBack;
