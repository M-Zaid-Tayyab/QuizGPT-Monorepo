import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { icn } from "@/assets/icn";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ContinueLearningSheet from "./ContinueLearningSheet";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  skippedQuestions: Set<number>;
  isHistory: boolean;
  onGoHome: () => void;
  onContinueLearning: (userPrompt: string) => void;
  isLoading: boolean;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  skippedQuestions,
  isHistory,
  onGoHome,
  onContinueLearning,
  isLoading,
}) => {
  const answeredQuestions = totalQuestions - skippedQuestions.size;
  const percentage = Math.round((score / answeredQuestions) * 100);
  const continueLearningRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();

  const onClose = () => {
    navigation.goBack();
  };

  const getPerformanceData = () => {
    if (percentage >= 90) {
      return {
        level: "Excellent!",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        progressColor: "bg-success",
        emoji: "🏆",
        message: "Outstanding performance! You're a quiz master!",
      };
    } else if (percentage >= 80) {
      return {
        level: "Great!",
        color: "text-blue",
        bgColor: "bg-blue/10",
        borderColor: "border-blue/20",
        progressColor: "bg-blue",
        emoji: "🎉",
        message: "Great job! You really know your stuff!",
      };
    } else if (percentage >= 70) {
      return {
        level: "Good!",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        progressColor: "bg-warning",
        emoji: "👍",
        message: "Good work! Keep up the momentum!",
      };
    } else if (percentage >= 50) {
      return {
        level: "Fair",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        progressColor: "bg-orange-500",
        emoji: "📚",
        message: "Not bad! A bit more practice will help!",
      };
    } else {
      return {
        level: "Keep Learning",
        color: "text-error",
        bgColor: "bg-error/10",
        borderColor: "border-error/20",
        progressColor: "bg-error",
        emoji: "💪",
        message: "Don't give up! Every attempt makes you stronger!",
      };
    }
  };

  const performance = getPerformanceData();

  return (
    <View className="flex-1 bg-background py-safe px-4">
      <TouchableOpacity className="absolute top-10 right-6" onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View className="flex-1 justify-center items-center p-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-primary/50 rounded-full items-center justify-center mb-4">
            <Image source={icn.generate} className="w-10 h-10" />
          </View>
          <Text className="text-3xl font-nunito-bold text-textPrimary mb-2">
            Quiz Complete!
          </Text>
          <Text className="text-textSecondary text-center">
            You&apos;ve finished another learning session
          </Text>
        </View>
        <View
          className={`w-full ${performance.bgColor} ${performance.borderColor} border rounded-3xl p-6 mb-6`}
        >
          <View className="items-center">
            <Text className="text-6xl mb-2">{performance.emoji}</Text>
            <Text
              className={`text-2xl font-nunito-bold ${performance.color} mb-2`}
            >
              {performance.level}
            </Text>
            <Text className="text-textSecondary text-center mb-4">
              {performance.message}
            </Text>
            <View className="bg-white rounded-2xl p-4 w-full shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-textSecondary font-nunito-medium">
                  Score
                </Text>
                <Text className="text-textPrimary font-nunito-bold">
                  {score}/{answeredQuestions}
                </Text>
              </View>
              <View className="w-full bg-greyBackground rounded-full h-3 mb-2">
                <View
                  className={`h-3 rounded-full ${performance.progressColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </View>
              <Text
                className={`text-center font-nunito-bold text-lg ${performance.color}`}
              >
                {percentage}%
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row justify-between w-full mb-8">
          <View className="flex-1 bg-white rounded-2xl p-4 mx-1 shadow-sm">
            <Text className="text-textSecondary text-center font-nunito-medium text-sm mb-1">
              Answered
            </Text>
            <Text className="text-textPrimary text-center font-nunito-bold text-xl">
              {answeredQuestions}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 mx-1 shadow-sm">
            <Text className="text-textSecondary text-center font-nunito-medium text-sm mb-1">
              Skipped
            </Text>
            <Text className="text-textPrimary text-center font-nunito-bold text-xl">
              {skippedQuestions.size}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 mx-1 shadow-sm">
            <Text className="text-textSecondary text-center font-nunito-medium text-sm mb-1">
              Total
            </Text>
            <Text className="text-textPrimary text-center font-nunito-bold text-xl">
              {totalQuestions}
            </Text>
          </View>
        </View>
        {!isHistory && (
          <PrimaryButton
            title={"Continue Learning"}
            onPress={() => continueLearningRef.current?.expand()}
            className="w-full rounded-2xl"
          />
        )}
      </View>
      <ContinueLearningSheet
        bottomSheetRef={continueLearningRef}
        onContinueLearning={onContinueLearning}
        onGoHome={onGoHome}
      />
      <AnimatedLoadingModal isVisible={isLoading} />
    </View>
  );
};

export default QuizResults;
