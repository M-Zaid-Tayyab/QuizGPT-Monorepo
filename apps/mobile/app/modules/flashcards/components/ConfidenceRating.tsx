import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

interface ConfidenceRatingProps {
  showRating: boolean;
  showConfidence: boolean;
  confidenceLevel: ConfidenceLevel | null;
  onConfidenceSelect: (level: ConfidenceLevel) => void;
}

const ConfidenceRating: React.FC<ConfidenceRatingProps> = ({
  showRating,
  showConfidence,
  confidenceLevel,
  onConfidenceSelect,
}) => {
  if (!showRating || !showConfidence) {
    return null;
  }

  return (
    <View className="mt-6 mx-4">
      <Text className="text-textPrimary font-nunito-bold text-base text-center mb-4">
        🎯 How confident are you?
      </Text>

      <View className="flex-row justify-center gap-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => onConfidenceSelect(level as ConfidenceLevel)}
            className={clsx(
              "w-14 h-14 rounded-full items-center justify-center",
              confidenceLevel === level ? "bg-primary" : "bg-greyBackground"
            )}
            activeOpacity={0.8}
          >
            <Text
              className={clsx(
                "font-nunito-bold text-xl",
                confidenceLevel === level ? "text-white" : "text-textPrimary"
              )}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row justify-between mt-4">
        <Text className="text-textSecondary font-nunito-medium text-sm">
          Not at all
        </Text>
        <Text className="text-textSecondary font-nunito-medium text-sm">
          Perfectly
        </Text>
      </View>
    </View>
  );
};

export default ConfidenceRating;
