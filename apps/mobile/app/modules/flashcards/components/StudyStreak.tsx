import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface StudyStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  className?: string;
}

const StudyStreak: React.FC<StudyStreakProps> = ({
  currentStreak,
  longestStreak,
  lastStudyDate,
  className,
}) => {
  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "🔥";
    if (streak < 7) return "🔥";
    if (streak < 30) return "🔥🔥";
    if (streak < 100) return "🔥🔥🔥";
    return "🔥🔥🔥🔥";
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your study streak!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "You're on fire!";
    if (streak < 30) return "Amazing dedication!";
    if (streak < 100) return "You're unstoppable!";
    return "Legendary streak!";
  };

  const isStreakActive = () => {
    if (!lastStudyDate) return false;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastStudy = new Date(lastStudyDate);
    return (
      lastStudy.toDateString() === today.toDateString() ||
      lastStudy.toDateString() === yesterday.toDateString()
    );
  };

  return (
    <View className={clsx("bg-white rounded-2xl shadow-sm p-4", className)}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-textPrimary font-nunito-bold text-lg">
          Study Streak
        </Text>
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{getStreakEmoji(currentStreak)}</Text>
          <Ionicons
            name="flame"
            size={20}
            color={currentStreak > 0 ? colors.warning : colors.textSecondary}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-textSecondary font-nunito text-sm">
            Current Streak
          </Text>
          <Text className="text-textPrimary font-nunito-bold text-2xl">
            {currentStreak} days
          </Text>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-textSecondary font-nunito text-sm">
            Longest Streak
          </Text>
          <Text className="text-textPrimary font-nunito-bold text-2xl">
            {longestStreak} days
          </Text>
        </View>
      </View>

      <View className="bg-greyBackground rounded-xl p-3 mb-4">
        <Text className="text-textPrimary font-nunito text-sm text-center">
          {getStreakMessage(currentStreak)}
        </Text>
      </View>

      {!isStreakActive() && currentStreak > 0 && (
        <View className="bg-error/10 border border-error/20 rounded-xl p-3">
          <Text className="text-error font-nunito-semibold text-sm text-center">
            ⚠️ Your streak will break if you don't study today!
          </Text>
        </View>
      )}

      {currentStreak === 0 && (
        <TouchableOpacity className="bg-primary rounded-xl py-3">
          <Text className="text-white font-nunito-semibold text-center">
            Start Studying Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StudyStreak;

