import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

interface QuizProgressBarProps {
  animatedStyle: any;
}

const QuizProgressBar: React.FC<QuizProgressBarProps> = ({ animatedStyle }) => {
  return (
    <View className="h-2 bg-borderColor rounded-full overflow-hidden">
      <Animated.View
        className="h-full bg-primary rounded-full"
        style={animatedStyle}
      />
    </View>
  );
};

export default QuizProgressBar;
