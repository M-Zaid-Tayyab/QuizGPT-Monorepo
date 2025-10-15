import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type StudyMode =
  | "learn"
  | "flashcards"
  | "write"
  | "test"
  | "match"
  | "spell";

interface StudyModeSelectorProps {
  selectedMode: StudyMode;
  onModeSelect: (mode: StudyMode) => void;
  className?: string;
}

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  className,
}) => {
  const studyModes = [
    {
      id: "learn" as const,
      name: "Learn",
      description: "Adaptive learning",
      emoji: "🎓",
      color: colors.primary,
      comingSoon: false,
    },
    {
      id: "flashcards" as const,
      name: "Flashcards",
      description: "Traditional flip cards",
      emoji: "🃏",
      color: colors.blue,
      comingSoon: false,
    },
    {
      id: "write" as const,
      name: "Write",
      description: "Type the answer",
      emoji: "✍️",
      color: colors.success,
      comingSoon: true,
    },
    {
      id: "test" as const,
      name: "Test",
      description: "Multiple choice",
      emoji: "🧪",
      color: colors.warning,
      comingSoon: true,
    },
    {
      id: "match" as const,
      name: "Match",
      description: "Drag and drop",
      emoji: "🔗",
      color: colors.purple,
      comingSoon: true,
    },
    {
      id: "spell" as const,
      name: "Spell",
      description: "Audio spelling",
      emoji: "🔊",
      color: colors.pink,
      comingSoon: true,
    },
  ];

  return (
    <View className={clsx("bg-white rounded-2xl shadow-sm p-4", className)}>
      <View className="gap-3">
        {studyModes.map((mode) => {
          const isDisabled = mode.comingSoon;
          return (
            <TouchableOpacity
              key={mode.id}
              onPress={() => {
                if (!isDisabled) onModeSelect(mode.id);
              }}
              disabled={isDisabled}
              className={clsx(
                "flex-row items-center p-3 rounded-xl border border-greyBackground bg-white",
                isDisabled && "opacity-60"
              )}
              activeOpacity={isDisabled ? 1 : 0.7}
              accessibilityRole={isDisabled ? "text" : "button"}
              accessibilityLabel={`${mode.name} mode`}
              accessibilityHint={isDisabled ? "Coming soon" : mode.description}
            >
              <Text className="text-2xl mr-3">{mode.emoji}</Text>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-nunito-bold text-base text-textPrimary">
                    {mode.name}
                  </Text>
                  {mode.comingSoon && (
                    <View className="bg-greyBackground rounded-full px-2 py-1">
                      <Text className="text-textSecondary font-nunito-bold text-xs">
                        COMING SOON
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-textSecondary font-nunito text-sm mt-0.5">
                  {mode.comingSoon
                    ? "Available in the next update"
                    : mode.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDisabled ? colors.grey : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-4 bg-greyBackground rounded-xl p-3">
        <Text className="text-textSecondary font-nunito-medium text-center text-sm">
          💡 Start with Learn mode for adaptive studying!
        </Text>
      </View>
    </View>
  );
};

export default StudyModeSelector;
