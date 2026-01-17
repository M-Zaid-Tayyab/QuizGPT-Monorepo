import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FlashcardHeaderProps {
  deckName: string;
  currentIndex: number;
  totalCards: number;
  onBackPress: () => void;
}

const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  deckName,
  currentIndex,
  totalCards,
  onBackPress,
}) => {
  return (
    <View className="flex-row justify-between py-4 px-4">
      <TouchableOpacity onPress={onBackPress}>
        <Ionicons name="chevron-back" size={24} color={colors.black} />
      </TouchableOpacity>
      <Text
        className="text-xl font-nunito-bold text-textPrimary text-center w-[60%]"
        numberOfLines={2}
      >
        {deckName?.trim()}
      </Text>
      <Text className="font-nunito text-textSecondary">
        {currentIndex + 1}/{totalCards}
      </Text>
    </View>
  );
};

export default FlashcardHeader;
