import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

interface TextInputQuestionProps {
  question: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  placeholder: string;
  keyboardType?: "numeric" | "default";
  maxLength?: number;
  cardAnimatedStyle: any;
  iconAnimatedStyle: any;
  onAnswer: (value: string) => void;
  isAnimating: boolean;
}

const TextInputQuestion: React.FC<TextInputQuestionProps> = ({
  question,
  subtitle,
  icon,
  iconColor,
  placeholder,
  keyboardType = "default",
  maxLength,
  cardAnimatedStyle,
  iconAnimatedStyle,
  onAnswer,
  isAnimating,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validateAge = (value: string) => {
    const age = parseInt(value);
    if (isNaN(age)) {
      return "Please enter a valid age";
    }
    return "";
  };

  const handleContinue = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setError("Please enter your age");
      return;
    }

    const validationError = validateAge(trimmedValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onAnswer(trimmedValue);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (error) {
      setError("");
    }
  };

  return (
    <Animated.View style={cardAnimatedStyle} className="flex-1">
      <View className="items-center w-full flex-1">
        <Animated.View
          style={iconAnimatedStyle}
          className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4"
        >
          <Ionicons name={icon as any} size={32} color={iconColor} />
        </Animated.View>

        <Text className="text-3xl text-textPrimary mb-2 text-center font-nunito-bold leading-tight">
          {question}
        </Text>

        <Text className="text-textSecondary text-center font-nunito-medium text-base leading-6 max-w-xs">
          {subtitle}
        </Text>
        <View className="items-center mt-10">
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={inputValue}
            onChangeText={handleInputChange}
            keyboardType={keyboardType}
            maxLength={maxLength}
            cursorColor={colors.black}
            autoFocus
            style={styles.input}
          />
          <Text className="text-textPrimary text-center font-nunito-semibold text-lg">
            Years
          </Text>
        </View>
      </View>
      <PrimaryButton
        title="Continue"
        onPress={handleContinue}
        disabled={!inputValue.trim() || isAnimating}
        className="absolute bottom-10 w-full"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 60,
    fontFamily: "Nunito-Bold",
    width: "100%",
  },
});

export default TextInputQuestion;
