import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface WriteModeProps {
  flashcard: Flashcard;
  onAnswer: (isCorrect: boolean, responseTime: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalCards: number;
  isFirst: boolean;
  isLast: boolean;
}

const WriteMode: React.FC<WriteModeProps> = ({
  flashcard,
  onAnswer,
  onNext,
  onPrevious,
  currentIndex,
  totalCards,
  isFirst,
  isLast,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTime, setResponseTime] = useState(0);

  const { width } = Dimensions.get("window");

  useEffect(() => {
    setUserAnswer("");
    setShowResult(false);
    setStartTime(Date.now());
  }, [flashcard]);

  const handleSubmit = () => {
    if (userAnswer.trim().length === 0) return;

    const endTime = Date.now();
    const time = endTime - startTime;
    setResponseTime(time);

    // Simple answer checking (can be improved with fuzzy matching)
    const correctAnswer = flashcard.back.toLowerCase().trim();
    const userInput = userAnswer.toLowerCase().trim();

    // Check for exact match or partial match
    const isAnswerCorrect =
      correctAnswer === userInput ||
      correctAnswer.includes(userInput) ||
      userInput.includes(correctAnswer);

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
  };

  const handleNext = () => {
    if (showResult) {
      onAnswer(isCorrect, responseTime);
      onNext();
    } else {
      handleSubmit();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return colors.success;
      case "Medium":
        return colors.warning;
      case "Hard":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View className="flex-1 bg-background px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between py-4">
        <TouchableOpacity
          onPress={onPrevious}
          disabled={isFirst}
          className={clsx(
            "flex-row items-center px-3 py-2 rounded-lg",
            isFirst ? "opacity-50" : "bg-white"
          )}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isFirst ? colors.textSecondary : colors.primary}
          />
          <Text
            className={clsx(
              "ml-1 font-nunito-semibold",
              isFirst ? "text-textSecondary" : "text-primary"
            )}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="text-textSecondary font-nunito text-sm">
            {currentIndex + 1} of {totalCards}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNext}
          disabled={isLast && !showResult}
          className={clsx(
            "flex-row items-center px-3 py-2 rounded-lg",
            isLast && !showResult ? "opacity-50" : "bg-white"
          )}
        >
          <Text
            className={clsx(
              "mr-1 font-nunito-semibold",
              isLast && !showResult ? "text-textSecondary" : "text-primary"
            )}
          >
            {showResult ? "Next" : "Skip"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              isLast && !showResult ? colors.textSecondary : colors.primary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="bg-greyBackground rounded-full h-2 mb-6">
        <View
          className="bg-primary rounded-full h-2"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </View>

      {/* Question Card */}
      <View className="flex-1 justify-center">
        <View className="bg-white rounded-2xl shadow-sm p-6 min-h-80">
          <View className="flex-row items-center mb-4">
            <View
              className="px-3 py-1 rounded-full mr-2"
              style={{
                backgroundColor:
                  getDifficultyColor(flashcard.difficulty) + "20",
              }}
            >
              <Text
                className="text-xs font-nunito-semibold"
                style={{ color: getDifficultyColor(flashcard.difficulty) }}
              >
                {flashcard.difficulty}
              </Text>
            </View>
            <Text className="text-textSecondary font-nunito text-sm">
              {flashcard.category}
            </Text>
          </View>

          <Text className="text-textPrimary text-xl font-nunito-bold text-center leading-7 mb-6">
            {flashcard.front}
          </Text>

          {!showResult ? (
            <View>
              <Text className="text-textSecondary font-nunito text-sm mb-3">
                Type your answer:
              </Text>
              <TextInput
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Enter your answer here..."
                className="bg-greyBackground rounded-xl p-4 text-textPrimary font-nunito text-base"
                multiline
                autoFocus
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-center mb-4">
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={48}
                  color={isCorrect ? colors.success : colors.error}
                />
                <Text
                  className={clsx(
                    "font-nunito-bold text-xl ml-3",
                    isCorrect ? "text-success" : "text-error"
                  )}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </Text>
              </View>

              <View className="bg-greyBackground rounded-xl p-4 mb-4">
                <Text className="text-textSecondary font-nunito text-sm mb-2">
                  Your answer:
                </Text>
                <Text className="text-textPrimary font-nunito text-base">
                  {userAnswer}
                </Text>
              </View>

              <View className="bg-primary/10 rounded-xl p-4">
                <Text className="text-primary font-nunito text-sm mb-2">
                  Correct answer:
                </Text>
                <Text className="text-textPrimary font-nunito text-base">
                  {flashcard.back}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View className="mt-6">
        <TouchableOpacity
          onPress={handleNext}
          className={clsx(
            "rounded-xl py-4 flex-row items-center justify-center",
            showResult ? (isCorrect ? "bg-success" : "bg-error") : "bg-primary"
          )}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showResult ? "arrow-forward" : "checkmark"}
            size={20}
            color="white"
          />
          <Text className="text-white font-nunito-bold text-lg ml-2">
            {showResult ? "Continue" : "Check Answer"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WriteMode;

