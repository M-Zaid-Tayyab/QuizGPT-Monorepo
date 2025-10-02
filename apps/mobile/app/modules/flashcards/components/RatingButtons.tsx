import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RatingButtonsProps {
  showRating: boolean;
  showRatingState: boolean;
  onRate: (response: "again" | "hard" | "good" | "easy") => void;
}

const RatingButtons: React.FC<RatingButtonsProps> = ({
  showRating,
  showRatingState,
  onRate,
}) => {
  const getRatingColor = (response: string) => {
    switch (response) {
      case "again":
        return colors.error;
      case "hard":
        return colors.orange;
      case "good":
        return colors.success;
      case "easy":
        return colors.blue;
      default:
        return colors.primary;
    }
  };

  if (!showRating || !showRatingState) {
    return null;
  }

  return (
    <View className="mt-6 mx-4">
      <Text className="text-textPrimary font-nunito-bold text-base text-center mb-4">
        ⭐ How well did you know this?
      </Text>

      <View className="flex-row gap-3">
        {[
          {
            response: "again" as const,
            label: "Again",
            icon: "close-circle",
          },
          {
            response: "hard" as const,
            label: "Hard",
            icon: "remove-circle",
          },
          {
            response: "good" as const,
            label: "Good",
            icon: "checkmark-circle",
          },
          {
            response: "easy" as const,
            label: "Easy",
            icon: "star",
          },
        ].map(({ response, label, icon }) => (
          <TouchableOpacity
            key={response}
            onPress={() => onRate(response)}
            className="flex-1 py-4 rounded-2xl items-center"
            style={{ backgroundColor: getRatingColor(response) + "15" }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={getRatingColor(response)}
            />
            <Text
              className="font-nunito-bold text-sm mt-2"
              style={{ color: getRatingColor(response) }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default RatingButtons;
