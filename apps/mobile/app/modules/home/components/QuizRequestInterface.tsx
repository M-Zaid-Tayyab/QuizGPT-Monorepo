import Input from "@/app/components/Input";
import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface QuizRequestInterfaceProps {
  requestText: string;
  onTextChange: (text: string) => void;
  attachedFile: any;
  onFileRemove: () => void;
  onFilePickerOpen: () => void;
  onExampleSelect?: (example: string) => void;
  className?: string;
}

const QuizRequestInterface: React.FC<QuizRequestInterfaceProps> = ({
  requestText,
  onTextChange,
  attachedFile,
  onFileRemove,
  onFilePickerOpen,
  onExampleSelect,
  className,
}) => {
  const examples = [
    "Test me on fractions and percentages",
    "Quiz me on grammar and sentence structure",
    "Ask me about world capitals and countries",
  ];
  return (
    <View className={clsx("w-full", className)}>
      <Input
        value={requestText}
        onChangeText={onTextChange}
        placeholder="e.g., 'Create algebra problems for me' or 'Test my vocabulary skills' or 'Quiz me on famous scientists'"
        multiline
        numberOfCharacter={10000}
        className="min-h-64 !items-start"
        inputStyle={{
          textAlignVertical: "top",
          includeFontPadding: false,
          paddingVertical: 0,
        }}
        inputClassName="mt-1"
        leftIcon={() => (
          <TouchableOpacity
            onPress={onFilePickerOpen}
            className="p-2 bg-primary/10 rounded-full items-center justify-center mr-2"
          >
            <Ionicons name={"add"} size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      />

      {attachedFile && (
        <View className="mt-2 p-2 bg-greyBackground/50 rounded-lg border border-black/10 w-[50%]">
          <View className="flex-row items-center">
            {attachedFile.type.includes("image") ? (
              <MaterialCommunityIcons
                name="file-image"
                size={18}
                color={colors.black}
              />
            ) : (
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={18}
                color={colors.black}
              />
            )}
            <Text className="text-black font-nunito-semibold text-sm ml-2 flex-1">
              {attachedFile.name?.length > 15
                ? attachedFile.name?.slice(0, 15) + "..."
                : attachedFile.name}
            </Text>
            <TouchableOpacity onPress={onFileRemove} className="ml-2 p-1">
              <Ionicons name="close-circle" size={18} color={colors.red} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
        <View className="flex-row items-start">
          <Text className="text-lg mr-2">💡</Text>
          <View className="flex-1">
            <Text className="text-sm font-nunito-semibold text-green-800 mb-1">
              Pro Tip: Be Specific
            </Text>
            <Text className="text-sm font-nunito text-green-700 leading-5">
              Instead of &apos;biology stuff&apos;, try &apos;photosynthesis and
              cellular respiration&apos;
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4">
        <Text className="text-sm font-nunito-semibold text-textPrimary mb-3">
          Try these examples:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {examples.map((example, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onExampleSelect?.(example)}
                className="bg-primary/10 rounded-full px-3 py-2 mr-2 mb-2"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-nunito text-primary text-center">
                  {example}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default QuizRequestInterface;
