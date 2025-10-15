import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface StudyStatistics {
  totalCards: number;
  cardsDue: number;
  cardsLearning: number;
  cardsReviewing: number;
  cardsMastered: number;
  averageAccuracy: number;
  totalStudyTime: number;
}

interface StudyProgressProps {
  statistics: StudyStatistics;
  onStartStudy: () => void;
  className?: string;
}

const StudyProgress: React.FC<StudyProgressProps> = ({
  statistics,
  onStartStudy,
  className,
}) => {
  const getProgressPercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return colors.success;
    if (accuracy >= 60) return colors.warning;
    return colors.error;
  };

  const progressItems = [
    {
      title: "Cards Due",
      value: statistics.cardsDue,
      total: statistics.totalCards,
      color: colors.primary,
      icon: "time-outline",
    },
    {
      title: "Learning",
      value: statistics.cardsLearning,
      total: statistics.totalCards,
      color: colors.warning,
      icon: "school-outline",
    },
    {
      title: "Reviewing",
      value: statistics.cardsReviewing,
      total: statistics.totalCards,
      color: colors.blue,
      icon: "refresh-outline",
    },
    {
      title: "Mastered",
      value: statistics.cardsMastered,
      total: statistics.totalCards,
      color: colors.success,
      icon: "checkmark-circle-outline",
    },
  ];

  return (
    <View className={clsx("flex-1", className)}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-textPrimary font-nunito-bold text-xl">
              Study Progress
            </Text>
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color={colors.primary}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-textSecondary font-nunito text-sm">
                Total Cards
              </Text>
              <Text className="text-textPrimary font-nunito-bold text-2xl">
                {statistics.totalCards}
              </Text>
            </View>
            <View>
              <Text className="text-textSecondary font-nunito text-sm">
                Study Time
              </Text>
              <Text className="text-textPrimary font-nunito-bold text-2xl">
                {formatStudyTime(statistics.totalStudyTime)}
              </Text>
            </View>
            <View>
              <Text className="text-textSecondary font-nunito text-sm">
                Accuracy
              </Text>
              <Text
                className="font-nunito-bold text-2xl"
                style={{ color: getAccuracyColor(statistics.averageAccuracy) }}
              >
                {statistics.averageAccuracy.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Cards */}
        <View className="space-y-3 mb-4">
          {progressItems.map((item, index) => {
            const percentage = getProgressPercentage(item.value, item.total);

            return (
              <View key={index} className="bg-white rounded-2xl shadow-sm p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: item.color + "20" }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={16}
                        color={item.color}
                      />
                    </View>
                    <Text className="text-textPrimary font-nunito-semibold">
                      {item.title}
                    </Text>
                  </View>
                  <Text className="text-textPrimary font-nunito-bold">
                    {item.value}
                  </Text>
                </View>

                <View className="bg-greyBackground rounded-full h-2 mb-2">
                  <View
                    className="rounded-full h-2"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </View>

                <Text className="text-textSecondary font-nunito text-sm">
                  {percentage}% of total cards
                </Text>
              </View>
            );
          })}
        </View>

        {/* Study Actions */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-textPrimary font-nunito-bold text-lg mb-4">
            Quick Actions
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={onStartStudy}
              className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-nunito-bold text-lg ml-2">
                Start Study Session
              </Text>
            </TouchableOpacity>

            {statistics.cardsDue > 0 && (
              <View className="bg-primary/10 rounded-xl p-3">
                <Text className="text-primary font-nunito-semibold text-center">
                  {statistics.cardsDue} cards are due for review
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Study Tips */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Text className="text-lg mr-2">💡</Text>
            <View className="flex-1">
              <Text className="text-sm font-nunito-semibold text-blue-800 mb-1">
                Study Tip
              </Text>
              <Text className="text-sm font-nunito text-blue-700 leading-5">
                Study a little every day for better retention. The spaced
                repetition algorithm will help you review cards at the optimal
                time.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StudyProgress;
