import React from "react";
import { Text, View } from "react-native";

interface SkipMessageProps {
  isVisible: boolean;
}

const SkipMessage: React.FC<SkipMessageProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <View className="bg-warning/10 border border-warning rounded-lg p-3 mt-4">
      <Text className="text-warning text-center font-nunito-semibold">
        Question skipped due to report. Moved to next question...
      </Text>
    </View>
  );
};

export default SkipMessage;
