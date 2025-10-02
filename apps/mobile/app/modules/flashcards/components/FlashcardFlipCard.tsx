import colors from "@/app/constants/colors";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import FlashcardFaceBack from "./FlashcardFaceBack";
import FlashcardFaceFront from "./FlashcardFaceFront";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface FlashcardFlipCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onPress: () => void;
  pressScale: Animated.Value;
  frontTransform: any;
  backTransform: any;
  hintTransform: any;
  getDifficultyColor: (difficulty: string) => string;
  width: number;
  height: number;
}

const FlashcardFlipCard: React.FC<FlashcardFlipCardProps> = ({
  flashcard,
  isFlipped,
  onPress,
  pressScale,
  frontTransform,
  backTransform,
  hintTransform,
  getDifficultyColor,
  width,
  height,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width, height }}
      activeOpacity={0.9}
    >
      <View style={{ width, height }}>
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            transform: (isFlipped
              ? frontTransform
              : [...(frontTransform || []), ...(hintTransform || [])]) as any,
            backfaceVisibility: "hidden" as any,
            shadowColor: colors.shadow,
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
          className="bg-white rounded-2xl p-6 justify-center"
        >
          <FlashcardFaceFront
            flashcard={flashcard}
            getDifficultyColor={getDifficultyColor}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            transform: backTransform as any,
            backfaceVisibility: "hidden" as any,
            shadowColor: colors.shadow,
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
          className="bg-white rounded-2xl p-6 justify-center"
        >
          <FlashcardFaceBack
            flashcard={flashcard}
            getDifficultyColor={getDifficultyColor}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default FlashcardFlipCard;
