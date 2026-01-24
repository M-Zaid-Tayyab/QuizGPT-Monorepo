import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { Question } from "../hooks/useOnboardingConfig";

interface ChipsQuestionProps {
  question: Question;
  selectedAnswers: string[];
  isAnimating: boolean;
  cardAnimatedStyle: any;
  iconAnimatedStyle: any;
  onToggleAnswer: (value: string) => void;
  onContinue: () => void;
}

const ChipsQuestion: React.FC<ChipsQuestionProps> = ({
  question,
  selectedAnswers,
  isAnimating,
  cardAnimatedStyle,
  iconAnimatedStyle,
  onToggleAnswer,
  onContinue,
}) => {
  return (
    <Animated.View style={cardAnimatedStyle} className="flex-1 pb-24">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="items-center mb-8">
          <Animated.View
            style={iconAnimatedStyle}
            className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4"
          >
            <Ionicons
              name={question.icon as any}
              size={32}
              color={question.iconColor}
            />
          </Animated.View>

          <Text className="text-3xl text-textPrimary mb-2 text-center font-nunito-bold leading-tight">
            {question.question}
          </Text>

          <Text className="text-textSecondary text-center font-nunito-medium text-base leading-6 max-w-xs">
            {question.subtitle}
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswers.includes(option.value);
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onToggleAnswer(option.value)}
                className={`flex-row items-center px-4 py-3 rounded-full border ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-200"
                }`}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={18}
                  color={isSelected ? colors.white : option.color}
                  style={{ marginRight: 8 }}
                />
                <Text
                  className={`font-nunito-bold text-base ${
                    isSelected ? "text-white" : "text-textPrimary"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <PrimaryButton
        title="Continue"
        onPress={onContinue}
        disabled={selectedAnswers.length === 0 || isAnimating}
        className="absolute bottom-10 w-full"
      />
    </Animated.View>
  );
};

export default ChipsQuestion;
