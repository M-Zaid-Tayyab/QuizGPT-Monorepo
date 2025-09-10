import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ProQuizGpt: React.FC = () => {
  const navigation = useNavigation();

  const handleProUpgrade = () => {
    (navigation as any).navigate("Paywall");
  };

  return (
    <TouchableOpacity
      className="flex-row items-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
      onPress={handleProUpgrade}
      activeOpacity={0.8}
    >
      <View className="w-10 h-10 bg-darkPurple/10 rounded-xl items-center justify-center mr-4">
        <Ionicons name="diamond-outline" size={20} color={colors.darkPurple} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-nunito-bold text-base">
          Pro QuizGPT
        </Text>
        <Text className="text-gray-500 text-sm font-nunito mt-1">
          Unlock unlimited quizzes and premium features
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

export default ProQuizGpt;
