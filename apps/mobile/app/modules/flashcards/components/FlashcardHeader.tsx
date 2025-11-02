import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FlashcardHeaderProps {
  currentIndex: number;
  totalCards: number;
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  currentIndex,
  totalCards,
  isFirst,
  isLast,
  onPrevious,
  onNext,
}) => {
  return (
    <View className="flex-row items-center justify-between py-3 px-4">
      <TouchableOpacity
        onPress={onPrevious}
        disabled={isFirst}
        className={clsx(
          "flex-row items-center px-4 py-3 rounded-full",
          isFirst ? "opacity-30" : "bg-greyBackground"
        )}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={isFirst ? colors.textSecondary : colors.textPrimary}
        />
        <Text
          className={clsx(
            "ml-2 font-nunito-semibold text-sm",
            isFirst ? "text-textSecondary" : "text-textPrimary"
          )}
        >
          Previous
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center bg-greyBackground px-4 py-2 rounded-full">
        <Text className="text-textPrimary font-nunito-bold text-sm">
          {currentIndex + 1} / {totalCards}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={isLast}
        className={clsx(
          "flex-row items-center px-4 py-3 rounded-full",
          isLast ? "opacity-30" : "bg-greyBackground"
        )}
      >
        <Text
          className={clsx(
            "mr-2 font-nunito-semibold text-sm",
            isLast ? "text-textSecondary" : "text-textPrimary"
          )}
        >
          Next
        </Text>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={isLast ? colors.textSecondary : colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FlashcardHeader;
