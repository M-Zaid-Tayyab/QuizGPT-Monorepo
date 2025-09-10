import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuizHeaderProps {
  description: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onBackPress: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  description,
  currentQuestionIndex,
  totalQuestions,
  onBackPress,
}) => {
  return (
    <View className="flex-row justify-between py-4">
      <TouchableOpacity onPress={onBackPress}>
        <Ionicons name="arrow-back" size={24} color={colors.black} />
      </TouchableOpacity>
      <Text
        className="text-xl font-nunito-bold text-textPrimary text-center w-[60%]"
        numberOfLines={2}
      >
        {description?.trim()}
      </Text>
      <Text className="font-nunito text-textSecondary">
        {currentQuestionIndex + 1}/{totalQuestions}
      </Text>
    </View>
  );
};

export default QuizHeader;
