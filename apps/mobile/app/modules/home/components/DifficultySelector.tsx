import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const DIFFICULTY_LEVELS = [
  { label: "Easy", value: "easy", emoji: "🌱" },
  { label: "Medium", value: "medium", emoji: "🌿" },
  { label: "Hard", value: "hard", emoji: "🔥" },
];

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View className="flex-row gap-3 mt-2">
      {DIFFICULTY_LEVELS.map((level) => {
        const isSelected = value === level.value;
        return (
          <TouchableOpacity
            key={level.value}
            onPress={() => onChange(level.value)}
            className={clsx(
              "w-[20%] h-16 rounded-xl justify-center items-center border",
              isSelected
                ? "bg-primary/10 border-primary"
                : "bg-transparent border-borderColor"
            )}
          >
            <View className="items-center">
              <Text className="text-lg">{level.emoji}</Text>
              <Text
                className={clsx(
                  "text-sm font-nunito-semibold mt-1",
                  isSelected ? "text-primary" : "text-textPrimary"
                )}
              >
                {level.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default DifficultySelector;
