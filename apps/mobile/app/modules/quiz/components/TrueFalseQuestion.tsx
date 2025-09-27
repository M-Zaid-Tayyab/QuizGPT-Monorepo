import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { QuizQuestion as QuizQuestionType } from "../hooks/useQuizGame";
import QuizOption from "./QuizOption";

interface TrueFalseQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  isAnswerSubmitted: boolean;
  isHistory: boolean;
  skippedQuestions: Set<number>;
  getOptionAnimatedStyle: (index: number) => any;
  onAnswerSelect: (index: number) => void;
  onNextQuestion: () => void;
  totalQuestions: number;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  questionIndex,
  currentQuestionIndex,
  selectedAnswer,
  isAnswerSubmitted,
  isHistory,
  skippedQuestions,
  getOptionAnimatedStyle,
  onAnswerSelect,
  onNextQuestion,
  totalQuestions,
}) => {
  const isCurrentQuestion = questionIndex === currentQuestionIndex;
  const correctAnswerIndex =
    typeof question.correctAnswer === "number"
      ? question.correctAnswer
      : parseInt(question.correctAnswer, 10);

  const showNextButton =
    (isAnswerSubmitted || isHistory || skippedQuestions.has(questionIndex)) &&
    isCurrentQuestion;

  return (
    <View className="w-full">
      <Text className="text-xl font-nunito-bold text-textPrimary mb-8">
        {question.question}
        {skippedQuestions.has(questionIndex) && (
          <Text className="text-error text-sm font-nunito-semibold ml-2">
            (Skipped)
          </Text>
        )}
      </Text>

      <View className="mb-8">
        {question.options.map((option: string, index: number) => {
          let isSelected, isCorrect;

          if (isHistory) {
            isSelected = question.selectedAnswer === index;
            isCorrect = correctAnswerIndex === index;
          } else {
            isSelected = selectedAnswer === index;
            isCorrect = correctAnswerIndex === index;
          }

          return (
            <QuizOption
              key={`${questionIndex}-${index}`}
              option={option}
              index={index}
              isCurrentQuestion={isCurrentQuestion}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isAnswerSubmitted={isAnswerSubmitted}
              isHistory={isHistory}
              isSkipped={skippedQuestions.has(questionIndex)}
              animatedStyle={getOptionAnimatedStyle(index)}
              onPress={onAnswerSelect}
            />
          );
        })}
      </View>

      {showNextButton && (
        <TouchableOpacity
          className="bg-primary p-4 rounded-lg mb-4"
          onPress={onNextQuestion}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-nunito-bold text-lg">
            {questionIndex === totalQuestions - 1
              ? "Finish Quiz"
              : "Next Question"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TrueFalseQuestion;
