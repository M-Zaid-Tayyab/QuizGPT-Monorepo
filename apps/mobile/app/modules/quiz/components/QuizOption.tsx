import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

interface QuizOptionProps {
  option: string;
  index: number;
  isCurrentQuestion: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswerSubmitted: boolean;
  isHistory: boolean;
  isSkipped: boolean;
  animatedStyle?: any;
  onPress: (index: number) => void;
}

const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  index,
  isCurrentQuestion,
  isSelected,
  isCorrect,
  isAnswerSubmitted,
  isHistory,
  isSkipped,
  animatedStyle,
  onPress,
}) => {
  let baseStyle = "p-4 rounded-lg mb-3 border";
  let bg = "bg-white";
  let border = "border-transparent";
  let text = "text-gray-800 text-base";

  if (isHistory) {
    if (isSelected) {
      if (isCorrect) {
        bg = "bg-success/10";
        border = "border-success/40";
        text = "text-success text-base font-nunito-semibold";
      } else {
        bg = "bg-error/10";
        border = "border-error/40";
        text = "text-error text-base font-nunito-semibold";
      }
    } else if (isCorrect) {
      bg = "bg-success/10";
      border = "border-success/40";
      text = "text-success text-base font-nunito-semibold";
    }
  } else if ((isAnswerSubmitted || isHistory) && isCurrentQuestion) {
    if (isSelected) {
      if (isCorrect) {
        bg = "bg-success/10";
        border = "border-success/40";
        text = "text-success text-base font-nunito-semibold";
      } else {
        bg = "bg-error/10";
        border = "border-error/40";
        text = "text-error text-base font-nunito-semibold";
      }
    } else if (isCorrect) {
      bg = "bg-success/10";
      border = "border-success/40";
      text = "text-success text-base font-nunito-semibold";
    }
  } else if (isSelected && isCurrentQuestion) {
    bg = "bg-primary/10";
    border = "border-primary/40";
    text = "text-primary text-base font-nunito-semibold";
  }

  if (isSkipped) {
    bg = "bg-gray-100/10";
    border = "border-gray-300/40";
    text = "text-gray-500 text-base font-nunito-semibold";
  }

  const optionStyle = `${baseStyle} ${bg} ${border}`;
  const textStyle = text;

  const isDisabled =
    (isAnswerSubmitted || isHistory || isSkipped) && isCurrentQuestion;

  return (
    <Animated.View style={isCurrentQuestion ? animatedStyle : undefined}>
      <TouchableOpacity
        className={optionStyle}
        onPress={() =>
          isCurrentQuestion && !isSkipped ? onPress(index) : undefined
        }
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        <Text className={textStyle}>{option}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default QuizOption;
