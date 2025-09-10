import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  animatedStyle: any;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  animatedStyle,
}) => {
  return (
    <View className="px-6 mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-textSecondary font-nunito-medium text-base">
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text className="text-primary font-nunito-bold text-lg">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}%
        </Text>
      </View>

      <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-primary rounded-full"
          style={animatedStyle}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
