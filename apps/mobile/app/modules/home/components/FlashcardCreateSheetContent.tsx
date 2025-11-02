import Input from "@/app/components/Input";
import PrimaryButton from "@/app/components/PrimaryButton";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
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
  isGenerating?: boolean;
  onGenerate: (data: {
    text: string;
    category: string;
    count: number;
    difficulty: string;
    file?: any;
  }) => void;
};

const CATEGORIES = [
  { label: "Math", value: "Math", emoji: "🔢" },
  { label: "Science", value: "Science", emoji: "🔬" },
  { label: "History", value: "History", emoji: "📜" },
  { label: "Language", value: "Language", emoji: "🌐" },
  { label: "Literature", value: "Literature", emoji: "📚" },
  { label: "Business", value: "Business", emoji: "💼" },
  { label: "Medicine", value: "Medicine", emoji: "⚕️" },
  { label: "Engineering", value: "Engineering", emoji: "⚙️" },
  { label: "Arts", value: "Arts", emoji: "🎨" },
  { label: "Custom", value: "custom", emoji: "✏️" },
];

const FlashcardCreateSheetContent: React.FC<Props> = ({
  topicText,
  onTextChange,
  attachedFile,
  onFileRemove,
  onFileSelect,
  isGenerating,
  onGenerate,
}) => {
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [category, setCategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [count, setCount] = useState<number>(10);

  const isGenerateDisabled = useMemo(() => {
    return (
      (!topicText?.trim() && !attachedFile) ||
      !difficulty ||
      count < 1 ||
      count > 50
    );
  }, [topicText, attachedFile, difficulty, count]);

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
          title="Subject Category (Optional)"
          description="Help organize your flashcards"
        />
        <View className="mb-3">
          <ChipSelector
            options={CATEGORIES}
            value={selectedCategory}
            onChange={(value) => {
              if (value === "custom") {
                setShowCustomInput(true);
                setSelectedCategory("custom");
              } else {
                setSelectedCategory(value);
                setCategory(value);
                setShowCustomInput(false);
              }
            }}
          />
        </View>
        {showCustomInput && (
          <View className="mt-2">
            <Input
              value={category}
              onChangeText={(text) => setCategory(text)}
              placeholder="Enter custom category (e.g., Biology, Algebra)"
              autoFocus
            />
          </View>
        )}
      </View>

      <View className="mt-6">
        <SectionHeader title="Difficulty Level" />
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </View>

      <View className="mt-6">
        <SectionHeader
          title="Number of Cards"
          description="Choose between 1-50 cards"
        />
        <NumberPicker value={count} onChange={setCount} label="cards" />
      </View>

      <PrimaryButton
        title="✨ Generate Flashcards"
        onPress={() =>
          onGenerate({
            text: topicText,
            category: category || selectedCategory || "General",
            count,
            difficulty,
            file: attachedFile,
          })
        }
        disabled={isGenerating || isGenerateDisabled}
        className="my-6"
      />
    </View>
  );
};

export default FlashcardCreateSheetContent;
