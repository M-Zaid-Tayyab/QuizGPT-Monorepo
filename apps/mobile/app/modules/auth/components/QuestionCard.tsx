import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Question } from "../hooks/useOnboarding";
import OptionItem from "./OptionItem";

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  selectedAnswer: string | null;
  isAnimating: boolean;
  cardAnimatedStyle: any;
  iconAnimatedStyle: any;
  getOptionAnimatedStyle: (index: number) => any;
  onAnswer: (value: string, index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  selectedAnswer,
  isAnimating,
  cardAnimatedStyle,
  iconAnimatedStyle,
  getOptionAnimatedStyle,
  onAnswer,
}) => {
  return (
    <Animated.View style={cardAnimatedStyle}>
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

      <View className="gap-y-4">
        {question.options.map((option, optionIndex) => (
          <OptionItem
            key={`${questionIndex}-${optionIndex}`}
            option={option}
            optionIndex={optionIndex}
            questionIndex={questionIndex}
            isSelected={selectedAnswer === option.value}
            isAnimating={isAnimating}
            animatedStyle={getOptionAnimatedStyle(optionIndex)}
            onPress={onAnswer}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export default QuestionCard;
