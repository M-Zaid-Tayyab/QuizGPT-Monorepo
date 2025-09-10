import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface ExplanationButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const ExplanationButton: React.FC<ExplanationButtonProps> = ({
  onPress,
  disabled,
}) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center mt-4 self-center ${
        disabled ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name="information-circle-outline"
        size={22}
        color={colors.black}
      />
      <Text className={`font-nunito-bold text-lg ml-2 text-black`}>
        Explanation
      </Text>
    </TouchableOpacity>
  );
};

export default ExplanationButton;
