import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import BottomSheetModal from "@/components/BottomSheetModal";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { clsx } from "clsx";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";

type Props = {
  sheetRef: React.RefObject<GorhomBottomSheetModal | null>;
  onClose: () => void;
  topic: string;
  attachedFile?: any;
  onGenerateQuiz: (
    difficulty: string,
    questionTypes: string[],
    numberOfQuestions: number
  ) => void;
};

interface QuizPreferences {
  topic: string;
  difficulty: string;
  questionTypes: string[];
  numberOfQuestions: number;
  file?: any;
}

const DIFFICULTY_LEVELS = [
  {
    label: "Easy",
    value: "easy",
    icon: "leaf",
    emoji: "🌱",
  },
  {
    label: "Medium",
    value: "medium",
    icon: "trending-up",
    emoji: "🌿",
  },
  {
    label: "Hard",
    value: "hard",
    icon: "flame",
    emoji: "🔥",
  },
];

const QUESTION_TYPES = [
  {
    label: "Multiple Choice",
    value: "mcq",
    description: "Choose from options",
    icon: "list",
    emoji: "📋",
  },
  {
    label: "True/False",
    value: "true_false",
    description: "True or false statements",
    icon: "checkmark-circle",
    emoji: "✅",
  },
  {
    label: "Fill in the Blank",
    value: "fill_blank",
    description: "Complete the missing words",
    icon: "create",
    emoji: "✏️",
  },
];

function QuizPreferencesSheet({
  sheetRef,
  onGenerateQuiz,
  onClose,
  topic,
  attachedFile,
}: Props) {
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  const handleQuestionTypeToggle = useCallback((type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const isGenerateDisabled = useMemo(() => {
    return !difficulty || questionTypes.length === 0;
  }, [difficulty, questionTypes]);

  const onDismiss = useCallback(() => {
    setDifficulty("medium");
    setQuestionTypes([]);
    setNumberOfQuestions(10);
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, [sheetRef]);

  return (
    <BottomSheetModal
      sheetRef={sheetRef}
      onDismiss={onDismiss}
      scrollView
      maxDynamicContentSize={heightPercentageToDP(80)}
    >
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-sfPro-bold text-black mb-1">
              Quiz Preferences
            </Text>
            <Text className="text-sm font-sfPro text-gray-400">
              Customize your quiz
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <View className="p-3 rounded-xl bg-gray-50/50 border border-gray-100">
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mr-4 shadow-sm">
                <Text className="text-2xl">📚</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sfPro-medium text-gray-500 mb-2">
                  Quiz Topic
                </Text>
                <Text className="text-lg font-sfPro-semibold text-black">
                  {topic}
                </Text>
                {attachedFile && (
                  <View className="flex-row items-center bg-white/60 px-3 py-2 rounded-xl">
                    <Ionicons name="attach" size={14} color="#6B7280" />
                    <Text className="text-sm font-sfPro text-gray-600 ml-2">
                      {attachedFile.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-sfPro-semibold text-black mb-5">
            Difficulty Level
          </Text>
          <View className="flex-row gap-3">
            {DIFFICULTY_LEVELS.map((level) => {
              const isSelected = difficulty === level.value;
              return (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => setDifficulty(level.value)}
                  className={clsx(
                    "w-24 h-20 rounded-xl justify-center items-center mr-3",
                    isSelected
                      ? "bg-primary"
                      : "bg-white border border-borderColor"
                  )}
                >
                  <View className="items-center">
                    <Text className="text-lg">{level.emoji}</Text>
                    <Text
                      className={clsx(
                        "text-base font-sfPro-semibold",
                        isSelected ? "text-white" : "text-black"
                      )}
                    >
                      {level.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-sfPro-semibold text-black mb-2">
            Question Types
          </Text>
          <Text className="text-sm font-sfPro text-gray-400 mb-5">
            Select one or more question types
          </Text>
          <View className="gap-3">
            {QUESTION_TYPES.map((type) => {
              const isSelected = questionTypes.includes(type.value);
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => handleQuestionTypeToggle(type.value)}
                  className={clsx(
                    "px-4 py-3 rounded-xl border",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-borderColor bg-white"
                  )}
                >
                  <View className="flex-row items-center bg-transparent">
                    <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
                      <Text className="text-xl">{type.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={clsx(
                          "text-base font-sfPro-semibold mb-1",
                          isSelected ? "text-primary" : "text-black"
                        )}
                      >
                        {type.label}
                      </Text>
                      <Text
                        className={clsx(
                          "text-sm font-sfPro",
                          isSelected ? "text-primary/70" : "text-gray-500"
                        )}
                      >
                        {type.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-sfPro-semibold text-black">
            Number of Questions
          </Text>
          <Text className="text-sm font-sfPro text-gray-400 mt-2">
            Choose between 1-50 questions
          </Text>

          <View className="flex-row items-start justify-center mt-6">
            <TouchableOpacity
              onPress={() =>
                setNumberOfQuestions(Math.max(1, numberOfQuestions - 1))
              }
              className={clsx(
                "w-12 h-12 rounded-2xl items-center justify-center",
                numberOfQuestions <= 1 ? "bg-gray-100" : "bg-greyBackground"
              )}
              disabled={numberOfQuestions <= 1}
            >
              <Ionicons
                name="remove"
                size={18}
                color={numberOfQuestions <= 1 ? "#9CA3AF" : colors.black}
              />
            </TouchableOpacity>

            <View className="flex-1 items-center mx-8">
              <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-2">
                <Text className="text-2xl font-sfPro-bold text-primary">
                  {numberOfQuestions}
                </Text>
              </View>
              <Text className="text-sm font-sfPro text-gray-500">
                questions
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setNumberOfQuestions(Math.min(50, numberOfQuestions + 1))
              }
              className={clsx(
                "w-12 h-12 rounded-2xl items-center justify-center",
                numberOfQuestions >= 50 ? "bg-gray-100" : "bg-green-100"
              )}
              disabled={numberOfQuestions >= 50}
            >
              <Ionicons
                name="add"
                size={18}
                color={numberOfQuestions >= 50 ? "#9CA3AF" : "#10B981"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton
          title="✨ Generate Quiz"
          onPress={() => {
            handleClose();
            onGenerateQuiz(difficulty, questionTypes, numberOfQuestions);
          }}
          disabled={isGenerateDisabled}
          className="my-6"
        />
      </View>
    </BottomSheetModal>
  );
}

export default memo(QuizPreferencesSheet);
