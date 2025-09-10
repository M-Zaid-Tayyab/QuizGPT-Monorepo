import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface ReportButtonProps {
  isReported: boolean;
  onPress: () => void;
}

const ReportButton: React.FC<ReportButtonProps> = ({ isReported, onPress }) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center absolute bottom-14 self-center ${
        isReported ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={isReported}
    >
      <Ionicons
        name="flag-outline"
        size={18}
        color={isReported ? colors.textSecondary : colors.red}
      />
      <Text
        className={`font-nunito-bold text-base ml-2 ${
          isReported ? "text-textSecondary" : "text-red"
        }`}
      >
        {isReported ? "Reported" : "Report"}
      </Text>
    </TouchableOpacity>
  );
};

export default ReportButton;
