import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

interface SpellModeProps {
  flashcards: Flashcard[];
  onComplete: (results: {
    correct: number;
    total: number;
    percentage: number;
    timeSpent: number;
  }) => void;
  onExit: () => void;
}

const SpellMode: React.FC<SpellModeProps> = ({
  flashcards,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
  });

  const { width } = Dimensions.get("window");

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const currentCard = flashcards[currentIndex];

  const handleSubmit = () => {
    if (userAnswer.trim().length === 0) return;

    const isAnswerCorrect = checkSpelling(userAnswer.trim(), currentCard.back);
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    setSessionStats((prev) => ({
      correct: prev.correct + (isAnswerCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const checkSpelling = (userInput: string, correctAnswer: string): boolean => {
    const normalizedUser = userInput.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();

    // Exact match
    if (normalizedUser === normalizedCorrect) return true;

    // Check for common spelling variations
    const variations = [
      normalizedCorrect,
      normalizedCorrect.replace(/s$/, ""), // Remove plural
      normalizedCorrect + "s", // Add plural
      normalizedCorrect.replace(/ing$/, ""), // Remove -ing
      normalizedCorrect.replace(/ed$/, ""), // Remove -ed
    ];

    return variations.includes(normalizedUser);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    const percentage = Math.round(
      (sessionStats.correct / sessionStats.total) * 100
    );

    onComplete({
      correct: sessionStats.correct,
      total: sessionStats.total,
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

  const speakText = (text: string) => {
    // This would integrate with text-to-speech
    Alert.alert("Audio", `Playing: ${text}`);
  };

  if (currentIndex >= flashcards.length) {
    const percentage = Math.round(
      (sessionStats.correct / sessionStats.total) * 100
    );

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
              {percentage >= 70 ? "Spelling Master!" : "Keep Practicing!"}
            </Text>

            <Text className="text-textSecondary font-nunito text-lg mt-2 text-center">
              You spelled {sessionStats.correct} out of {sessionStats.total}{" "}
              correctly
            </Text>

            <View className="bg-primary/10 rounded-xl p-4 mt-6 w-full">
              <Text className="text-primary font-nunito-bold text-3xl text-center">
                {percentage}%
              </Text>
              <Text className="text-primary font-nunito text-sm text-center mt-1">
                Spelling Score
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
                  setUserAnswer("");
                  setShowResult(false);
                  setSessionStats({ correct: 0, total: 0 });
                  setStartTime(Date.now());
                }}
                className="flex-1 bg-primary rounded-xl py-3"
                activeOpacity={0.8}
              >
                <Text className="text-white font-nunito-semibold text-center">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between py-4">
        <TouchableOpacity onPress={onExit} className="flex-row items-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text className="text-textPrimary font-nunito-semibold ml-2">
            Exit Spell
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="text-textSecondary font-nunito text-sm">
            {currentIndex + 1} of {flashcards.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="bg-greyBackground rounded-full h-2 mb-6">
        <View
          className="bg-primary rounded-full h-2"
          style={{
            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
          }}
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
                  getDifficultyColor(currentCard.difficulty) + "20",
              }}
            >
              <Text
                className="text-xs font-nunito-semibold"
                style={{ color: getDifficultyColor(currentCard.difficulty) }}
              >
                {currentCard.difficulty}
              </Text>
            </View>
            <Text className="text-textSecondary font-nunito text-sm">
              {currentCard.category}
            </Text>
          </View>

          <Text className="text-textPrimary text-xl font-nunito-bold text-center leading-7 mb-6">
            {currentCard.front}
          </Text>

          {!showResult ? (
            <View>
              <View className="flex-row items-center justify-center mb-4">
                <TouchableOpacity
                  onPress={() => speakText(currentCard.back)}
                  className="bg-primary/10 rounded-full p-3"
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="volume-high"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-textSecondary font-nunito text-sm mb-3 text-center">
                Listen and spell the word:
              </Text>

              <TextInput
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type what you hear..."
                className="bg-greyBackground rounded-xl p-4 text-textPrimary font-nunito text-base text-center"
                autoFocus
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
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
                  Your spelling:
                </Text>
                <Text className="text-textPrimary font-nunito text-base">
                  {userAnswer}
                </Text>
              </View>

              <View className="bg-primary/10 rounded-xl p-4">
                <Text className="text-primary font-nunito text-sm mb-2">
                  Correct spelling:
                </Text>
                <Text className="text-textPrimary font-nunito text-base">
                  {currentCard.back}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View className="mt-6">
        <TouchableOpacity
          onPress={showResult ? handleNext : handleSubmit}
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
            {showResult ? "Next" : "Check Spelling"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SpellMode;

