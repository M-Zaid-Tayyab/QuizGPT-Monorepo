import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

interface TestModeProps {
  flashcards: Flashcard[];
  onComplete: (results: {
    correct: number;
    total: number;
    percentage: number;
    timeSpent: number;
  }) => void;
  onExit: () => void;
}

const TestMode: React.FC<TestModeProps> = ({
  flashcards,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { width } = Dimensions.get("window");

  useEffect(() => {
    generateTestQuestions();
    setStartTime(Date.now());
  }, []);

  const generateTestQuestions = () => {
    const testQuestions: TestQuestion[] = flashcards.map((card) => {
      // Generate 3 wrong options + 1 correct option
      const wrongOptions = flashcards
        .filter((c) => c._id !== card._id)
        .map((c) => c.back)
        .slice(0, 3);

      const options = [...wrongOptions, card.back];
      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      const correctIndex = shuffledOptions.indexOf(card.back);

      return {
        question: card.front,
        options: shuffledOptions,
        correctAnswer: correctIndex,
      };
    });

    setQuestions(testQuestions);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex].userAnswer = answerIndex;
    updatedQuestions[currentIndex].isCorrect =
      answerIndex === questions[currentIndex].correctAnswer;
    setQuestions(updatedQuestions);

    // Auto-advance after 1 second
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        completeTest();
      }
    }, 1000);
  };

  const completeTest = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    const correct = questions.filter((q) => q.isCorrect).length;
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);

    setIsComplete(true);
    setShowResults(true);

    onComplete({
      correct,
      total,
      percentage,
      timeSpent,
    });
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

  const getOptionColor = (optionIndex: number, question: TestQuestion) => {
    if (!showResults) {
      return question.userAnswer === optionIndex
        ? "bg-primary"
        : "bg-greyBackground";
    }

    if (optionIndex === question.correctAnswer) {
      return "bg-success";
    }

    if (
      optionIndex === question.userAnswer &&
      optionIndex !== question.correctAnswer
    ) {
      return "bg-error";
    }

    return "bg-greyBackground";
  };

  const getOptionTextColor = (optionIndex: number, question: TestQuestion) => {
    if (!showResults) {
      return question.userAnswer === optionIndex
        ? "text-white"
        : "text-textPrimary";
    }

    if (optionIndex === question.correctAnswer) {
      return "text-white";
    }

    if (
      optionIndex === question.userAnswer &&
      optionIndex !== question.correctAnswer
    ) {
      return "text-white";
    }

    return "text-textPrimary";
  };

  if (isComplete && showResults) {
    const correct = questions.filter((q) => q.isCorrect).length;
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);

    return (
      <View className="flex-1 bg-background px-4 py-8">
        <View className="flex-1 justify-center">
          <View className="bg-white rounded-2xl shadow-sm p-8 items-center">
            <Ionicons
              name={percentage >= 70 ? "trophy" : "school-outline"}
              size={64}
              color={percentage >= 70 ? colors.warning : colors.primary}
            />

            <Text className="text-textPrimary font-nunito-bold text-2xl mt-4 text-center">
              {percentage >= 70 ? "Great Job!" : "Keep Studying!"}
            </Text>

            <Text className="text-textSecondary font-nunito text-lg mt-2 text-center">
              You scored {correct} out of {total}
            </Text>

            <View className="bg-primary/10 rounded-xl p-4 mt-6 w-full">
              <Text className="text-primary font-nunito-bold text-3xl text-center">
                {percentage}%
              </Text>
              <Text className="text-primary font-nunito text-sm text-center mt-1">
                Final Score
              </Text>
            </View>

            <View className="flex-row mt-6 space-x-4">
              <TouchableOpacity
                onPress={onExit}
                className="flex-1 bg-greyBackground rounded-xl py-3"
                activeOpacity={0.8}
              >
                <Text className="text-textPrimary font-nunito-semibold text-center">
                  Exit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setCurrentIndex(0);
                  setShowResults(false);
                  setIsComplete(false);
                  generateTestQuestions();
                  setStartTime(Date.now());
                }}
                className="flex-1 bg-primary rounded-xl py-3"
                activeOpacity={0.8}
              >
                <Text className="text-white font-nunito-semibold text-center">
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View className="flex-1 bg-background px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between py-4">
        <TouchableOpacity onPress={onExit} className="flex-row items-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text className="text-textPrimary font-nunito-semibold ml-2">
            Exit Test
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="text-textSecondary font-nunito text-sm">
            {currentIndex + 1} of {questions.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="bg-greyBackground rounded-full h-2 mb-6">
        <View
          className="bg-primary rounded-full h-2"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </View>

      {/* Question */}
      <View className="flex-1 justify-center">
        <View className="bg-white rounded-2xl shadow-sm p-6 min-h-80">
          <Text className="text-textPrimary text-xl font-nunito-bold text-center leading-7 mb-8">
            {currentQuestion?.question}
          </Text>

          <View className="space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswerSelect(index)}
                disabled={showResults}
                className={clsx(
                  "p-4 rounded-xl border-2",
                  getOptionColor(index, currentQuestion),
                  showResults ? "" : "border-greyBackground"
                )}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View
                    className={clsx(
                      "w-8 h-8 rounded-full items-center justify-center mr-4",
                      showResults
                        ? index === currentQuestion.correctAnswer
                          ? "bg-white/20"
                          : index === currentQuestion.userAnswer
                          ? "bg-white/20"
                          : "bg-white/10"
                        : "bg-white/20"
                    )}
                  >
                    <Text
                      className={clsx(
                        "font-nunito-bold text-sm",
                        getOptionTextColor(index, currentQuestion)
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>

                  <Text
                    className={clsx(
                      "font-nunito text-base flex-1",
                      getOptionTextColor(index, currentQuestion)
                    )}
                  >
                    {option}
                  </Text>

                  {showResults && index === currentQuestion.correctAnswer && (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  )}

                  {showResults &&
                    index === currentQuestion.userAnswer &&
                    index !== currentQuestion.correctAnswer && (
                      <Ionicons name="close-circle" size={24} color="white" />
                    )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default TestMode;

