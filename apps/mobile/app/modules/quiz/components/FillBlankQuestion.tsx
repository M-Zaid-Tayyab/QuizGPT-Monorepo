import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { QuizQuestion as QuizQuestionType } from "../hooks/useQuizGame";

interface FillBlankQuestionProps {
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
  onTextAnswer?: (answer: string) => void;
}

const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
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
  onTextAnswer,
}) => {
  const [userInput, setUserInput] = useState(question.userAnswer || "");
  const isCurrentQuestion = questionIndex === currentQuestionIndex;
  const correctAnswer = question.options[0];

  const showNextButton =
    (isAnswerSubmitted || isHistory || skippedQuestions.has(questionIndex)) &&
    isCurrentQuestion;

  const normalizeAnswer = (answer: string) => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");
  };

  const isCorrect =
    normalizeAnswer(userInput) === normalizeAnswer(correctAnswer);

  const handleTextChange = (text: string) => {
    setUserInput(text);
    if (onTextAnswer) {
      onTextAnswer(text);
    }
  };

  const handleSubmit = () => {
    if (userInput.trim()) {
      onAnswerSelect(0);
    }
  };

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
        <TextInput
          className={`p-4 rounded-lg border text-base font-nunito ${
            isHistory || isAnswerSubmitted
              ? isCorrect
                ? "bg-success/10 border-success text-success"
                : "bg-error/10 border-error text-error"
              : "bg-white border-gray-300 text-gray-800"
          } ${
            skippedQuestions.has(questionIndex)
              ? "bg-gray-100 border-gray-300 text-gray-500"
              : ""
          }`}
          placeholder="Type your answer here..."
          value={userInput}
          onChangeText={handleTextChange}
          editable={
            !isHistory &&
            !isAnswerSubmitted &&
            !skippedQuestions.has(questionIndex) &&
            isCurrentQuestion
          }
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {(isHistory || isAnswerSubmitted) && (
          <View className="mt-4 p-4 rounded-lg bg-gray-50">
            <Text className="text-sm font-nunito-semibold text-gray-700 mb-2">
              Correct Answer:
            </Text>
            <Text className="text-base font-nunito text-gray-800">
              {correctAnswer}
            </Text>
          </View>
        )}
      </View>

      {!isHistory &&
        !isAnswerSubmitted &&
        !skippedQuestions.has(questionIndex) &&
        isCurrentQuestion && (
          <TouchableOpacity
            className="bg-primary p-4 rounded-lg mb-4"
            onPress={handleSubmit}
            disabled={!userInput.trim()}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-nunito-bold text-lg">
              Submit Answer
            </Text>
          </TouchableOpacity>
        )}

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

export default FillBlankQuestion;
