import Input from "@/app/components/Input";
import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FlashcardGeneratorProps {
  onGenerate: (data: {
    text: string;
    category: string;
    count: number;
    difficulty: string;
    file?: any;
  }) => void;
  isGenerating?: boolean;
  className?: string;
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  onGenerate,
  isGenerating = false,
  className,
}) => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("General");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const categories = [
    "General",
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "History",
    "Geography",
    "Literature",
    "Language",
    "Computer Science",
  ];

  const difficulties = ["Easy", "Medium", "Hard"];
  const counts = [5, 10, 15, 20, 25];

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        Alert.alert("File Selected", `Selected: ${result.assets[0].name}`);
      }
    } catch {
      Alert.alert("Error", "Failed to select file");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleGenerate = () => {
    if (text.trim().length === 0 && !selectedFile) {
      Alert.alert(
        "Input Required",
        "Please enter text or upload a file to generate flashcards."
      );
      return;
    }

    onGenerate({
      text: text.trim(),
      category,
      count,
      difficulty,
      file: selectedFile,
    });
  };

  return (
    <View className={clsx("w-full", className)}>
      <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <Text className="text-textPrimary text-xl font-nunito-bold mb-6">
          🃏 Generate Flashcards
        </Text>

        <Input
          value={text}
          onChangeText={setText}
          placeholder="Paste your study material here... (text, notes, textbook content)"
          multiline
          numberOfCharacter={5000}
          className="min-h-32 !items-start"
          inputStyle={{
            textAlignVertical: "top",
            includeFontPadding: false,
            paddingVertical: 0,
          }}
          inputClassName="mt-1"
        />

        {/* File Upload Section */}
        <View className="mt-6">
          {!selectedFile ? (
            <TouchableOpacity
              onPress={handleFileUpload}
              className="bg-greyBackground rounded-xl py-3 px-4 flex-row items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color={colors.primary}
              />
              <Text className="text-primary font-nunito-semibold text-sm ml-2">
                📁 Upload File
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-primary/10 rounded-xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="document-text"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  className="text-primary font-nunito-semibold text-sm ml-2 flex-1"
                  numberOfLines={1}
                >
                  {selectedFile.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRemoveFile}
                className="ml-2"
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="mt-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-lg mr-2">🏷️</Text>
            <Text className="text-sm font-nunito-semibold text-textPrimary">
              Category
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={clsx(
                    "rounded-full px-4 py-2 mr-2",
                    category === cat ? "bg-primary" : "bg-primary/10"
                  )}
                  activeOpacity={0.7}
                >
                  <Text
                    className={clsx(
                      "text-sm font-nunito",
                      category === cat ? "text-white" : "text-primary"
                    )}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-lg mr-2">⚡</Text>
            <Text className="text-sm font-nunito-semibold text-textPrimary">
              Difficulty
            </Text>
          </View>
          <View className="flex-row mb-6">
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff}
                onPress={() => setDifficulty(diff)}
                className={clsx(
                  "rounded-full px-6 py-3 mr-4",
                  difficulty === diff ? "bg-primary" : "bg-primary/10"
                )}
                activeOpacity={0.7}
              >
                <Text
                  className={clsx(
                    "text-sm font-nunito-semibold text-center",
                    difficulty === diff ? "text-white" : "text-primary"
                  )}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center mb-3">
            <Text className="text-lg mr-2">🔢</Text>
            <Text className="text-sm font-nunito-semibold text-textPrimary">
              Count
            </Text>
          </View>
          <View className="flex-row">
            {counts.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCount(c)}
                className={clsx(
                  "rounded-full px-4 py-3 mr-3",
                  count === c ? "bg-primary" : "bg-primary/10"
                )}
                activeOpacity={0.7}
              >
                <Text
                  className={clsx(
                    "text-sm font-nunito-semibold text-center",
                    count === c ? "text-white" : "text-primary"
                  )}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Generate Button */}
      <PrimaryButton
        title={
          isGenerating ? "🔄 Generating..." : `⚡ Generate ${count} Flashcards`
        }
        onPress={handleGenerate}
        disabled={isGenerating}
        className="mt-6"
      />
    </View>
  );
};

export default FlashcardGenerator;
