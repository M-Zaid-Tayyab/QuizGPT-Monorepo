import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { Text, View } from "react-native";

interface StudyAnalyticsProps {
  totalCards: number;
  masteredCards: number;
  studyingCards: number;
  newCards: number;
  averageAccuracy: number;
  totalStudyTime: number;
  className?: string;
}

const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  totalCards,
  masteredCards,
  studyingCards,
  newCards,
  averageAccuracy,
  totalStudyTime,
  className,
}) => {
  const getMasteryPercentage = () => {
    return totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return colors.success;
    if (accuracy >= 60) return colors.warning;
    return colors.error;
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <View className={clsx("bg-white rounded-2xl shadow-sm p-4", className)}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-textPrimary font-nunito-bold text-lg">
          Study Analytics
        </Text>
        <Ionicons name="analytics" size={20} color={colors.primary} />
      </View>

      {/* Mastery Progress */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-textSecondary font-nunito text-sm">
            Mastery Progress
          </Text>
          <Text className="text-textPrimary font-nunito-bold text-sm">
            {getMasteryPercentage()}%
          </Text>
        </View>
        <View className="bg-greyBackground rounded-full h-2">
          <View
            className="bg-primary rounded-full h-2"
            style={{ width: `${getMasteryPercentage()}%` }}
          />
        </View>
      </View>

      {/* Card Status */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 items-center">
          <View className="bg-success/20 rounded-full w-12 h-12 items-center justify-center mb-2">
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
          </View>
          <Text className="text-textPrimary font-nunito-bold text-lg">
            {masteredCards}
          </Text>
          <Text className="text-textSecondary font-nunito text-xs text-center">
            Mastered
          </Text>
        </View>

        <View className="flex-1 items-center">
          <View className="bg-warning/20 rounded-full w-12 h-12 items-center justify-center mb-2">
            <Ionicons name="school" size={24} color={colors.warning} />
          </View>
          <Text className="text-textPrimary font-nunito-bold text-lg">
            {studyingCards}
          </Text>
          <Text className="text-textSecondary font-nunito text-xs text-center">
            Studying
          </Text>
        </View>

        <View className="flex-1 items-center">
          <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mb-2">
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </View>
          <Text className="text-textPrimary font-nunito-bold text-lg">
            {newCards}
          </Text>
          <Text className="text-textSecondary font-nunito text-xs text-center">
            New
          </Text>
        </View>
      </View>

      {/* Performance Stats */}
      <View className="space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={16} color={colors.warning} />
            <Text className="text-textSecondary font-nunito text-sm ml-2">
              Average Accuracy
            </Text>
          </View>
          <Text
            className="font-nunito-bold text-sm"
            style={{ color: getAccuracyColor(averageAccuracy) }}
          >
            {averageAccuracy}%
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text className="text-textSecondary font-nunito text-sm ml-2">
              Total Study Time
            </Text>
          </View>
          <Text className="text-textPrimary font-nunito-bold text-sm">
            {formatStudyTime(totalStudyTime)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="library" size={16} color={colors.blue} />
            <Text className="text-textSecondary font-nunito text-sm ml-2">
              Total Cards
            </Text>
          </View>
          <Text className="text-textPrimary font-nunito-bold text-sm">
            {totalCards}
          </Text>
        </View>
      </View>

      {/* Performance Indicator */}
      <View className="mt-4 bg-greyBackground rounded-xl p-3">
        <Text className="text-textSecondary font-nunito text-sm text-center">
          {averageAccuracy >= 80
            ? "🎉 Excellent performance! Keep up the great work!"
            : averageAccuracy >= 60
            ? "👍 Good progress! You're on the right track!"
            : "💪 Keep studying! Practice makes perfect!"}
        </Text>
      </View>
    </View>
  );
};

export default StudyAnalytics;

