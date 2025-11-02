import PrimaryButton from "@/app/components/PrimaryButton";
import { clsx } from "clsx";
import React, { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ChipSelector from "./ChipSelector";
import CreateRequestInput from "./CreateRequestInput";
import DifficultySelector from "./DifficultySelector";
import NumberPicker from "./NumberPicker";
import SectionHeader from "./SectionHeader";

type Props = {
  topicText: string;
  onTextChange: (text: string) => void;
  attachedFile: any;
  onFileRemove: () => void;
  onFileSelect: (file: any) => void;
  onGenerateQuiz: (
    difficulty: string,
    questionTypes: string[],
    numberOfQuestions: number,
    examType?: string
  ) => void;
};

const EXAM_TYPES = [
  { label: "General Practice", value: "general", emoji: "📚" },
  { label: "Final Exam", value: "final", emoji: "🎓" },
  { label: "Midterm", value: "midterm", emoji: "📝" },
  { label: "SAT/ACT", value: "sat_act", emoji: "🎯" },
  { label: "AP Exam", value: "ap", emoji: "⭐" },
  { label: "Chapter Review", value: "chapter", emoji: "📖" },
  { label: "Custom", value: "custom", emoji: "✏️" },
];

const QUESTION_TYPES = [
  {
    label: "Multiple Choice",
    value: "mcq",
    description: "Choose from options",
    emoji: "📋",
  },
  {
    label: "True/False",
    value: "true_false",
    description: "True or false statements",
    emoji: "✅",
  },
  {
    label: "Fill in the Blank",
    value: "fill_blank",
    description: "Complete the missing words",
    emoji: "✏️",
  },
];

const QuizCreateSheetContent: React.FC<Props> = ({
  topicText,
  onTextChange,
  attachedFile,
  onFileRemove,
  onFileSelect,
  onGenerateQuiz,
}) => {
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [questionTypes, setQuestionTypes] = useState<string[]>(["mcq"]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [examType, setExamType] = useState<string>("general");

  const handleQuestionTypeToggle = useCallback((type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const isGenerateDisabled = useMemo(() => {
    return (
      (!topicText?.trim() && !attachedFile) ||
      !difficulty ||
      questionTypes.length === 0
    );
  }, [topicText, attachedFile, difficulty, questionTypes]);

  return (
    <View className="flex-1">
      <CreateRequestInput
        topicText={topicText}
        onTextChange={onTextChange}
        attachedFile={attachedFile}
        onFileRemove={onFileRemove}
        onFileSelect={onFileSelect}
      />

      <View className="mt-6">
        <SectionHeader
          title="Exam Type (Optional)"
          description="What are you preparing for?"
        />
        <ChipSelector
          options={EXAM_TYPES}
          value={examType}
          onChange={setExamType}
        />
      </View>

      <View className="mt-6">
        <SectionHeader title="Difficulty Level" />
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </View>

      <View className="mt-6">
        <SectionHeader
          title="Question Types"
          description="Select one or more question types"
        />
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
                  <View className="w-11 h-11 rounded-xl bg-white items-center justify-center mr-3">
                    <Text className="text-xl">{type.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={clsx(
                        "text-base font-nunito-semibold mb-0.5",
                        isSelected ? "text-primary" : "text-textPrimary"
                      )}
                    >
                      {type.label}
                    </Text>
                    <Text
                      className={clsx(
                        "text-sm font-nunito",
                        isSelected ? "text-primary/70" : "text-textSecondary"
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
        <SectionHeader
          title="Number of Questions"
          description="Choose between 1-50 questions"
        />
        <NumberPicker
          value={numberOfQuestions}
          onChange={setNumberOfQuestions}
          label="questions"
        />
      </View>

      <PrimaryButton
        title="✨ Generate Quiz"
        onPress={() =>
          onGenerateQuiz(difficulty, questionTypes, numberOfQuestions, examType)
        }
        disabled={isGenerateDisabled}
        className="my-6"
      />
    </View>
  );
};

export default QuizCreateSheetContent;
