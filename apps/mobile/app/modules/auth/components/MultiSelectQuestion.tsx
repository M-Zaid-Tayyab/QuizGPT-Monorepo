import PrimaryButton from "@/app/components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Question } from "../hooks/useOnboardingConfig";
import OptionItem from "./OptionItem";

interface MultiSelectQuestionProps {
  question: Question;
  questionIndex: number;
  selectedAnswers: string[];
  isAnimating: boolean;
  cardAnimatedStyle: any;
  iconAnimatedStyle: any;
  getOptionAnimatedStyle: (index: number) => any;
  onToggleAnswer: (value: string) => void;
  onContinue: () => void;
}

const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({
  question,
  questionIndex,
  selectedAnswers,
  isAnimating,
  cardAnimatedStyle,
  iconAnimatedStyle,
  getOptionAnimatedStyle,
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

        <View className="gap-y-4">
          {question.options.map((option, optionIndex) => (
            <OptionItem
              key={`${questionIndex}-${optionIndex}`}
              option={option}
              optionIndex={optionIndex}
              questionIndex={questionIndex}
              isSelected={selectedAnswers.includes(option.value)}
              isAnimating={false} // Don't block interaction
              animatedStyle={getOptionAnimatedStyle(optionIndex)}
              onPress={(value) => onToggleAnswer(value)}
            />
          ))}
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

export default MultiSelectQuestion;
