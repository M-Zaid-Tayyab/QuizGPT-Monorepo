import PrimaryButton from "@/app/components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";

interface SliderQuestionProps {
  question: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  min: number;
  max: number;
  step: number;
  labels?: { left: string; right: string };
  cardAnimatedStyle: any;
  iconAnimatedStyle: any;
  onAnswer: (value: number) => void;
  isAnimating: boolean;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 24;
const TRACK_WIDTH = SCREEN_WIDTH - PADDING * 2;
const KNOB_SIZE = 40;

const SliderQuestion: React.FC<SliderQuestionProps> = ({
  question,
  subtitle,
  icon,
  iconColor,
  min,
  max,
  step,
  labels,
  cardAnimatedStyle,
  iconAnimatedStyle,
  onAnswer,
  isAnimating,
}) => {
  const [currentValue, setCurrentValue] = useState(Math.floor((min + max) / 2));
  
  const translateX = useSharedValue(0);
  const context = useSharedValue(0);

  // Initialize position based on default value
  useEffect(() => {
    const initialValue = Math.floor((min + max) / 2);
    const percentage = (initialValue - min) / (max - min);
    translateX.value = percentage * TRACK_WIDTH;
  }, [min, max, translateX]);

  const updateValue = (x: number) => {
    const percentage = Math.max(0, Math.min(1, x / TRACK_WIDTH));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    setCurrentValue(clampedValue);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateX.value;
    })
    .onUpdate((event) => {
      const newX = context.value + event.translationX;
      translateX.value = Math.max(0, Math.min(newX, TRACK_WIDTH));
      runOnJS(updateValue)(translateX.value);
    })
    .onEnd(() => {
    });

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value - KNOB_SIZE / 2 }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    };
  });

  const handleContinue = () => {
    onAnswer(currentValue);
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

        <Text className="text-textSecondary text-center font-nunito-medium text-base leading-6 max-w-xs mb-12">
          {subtitle}
        </Text>

        <View className="w-full items-center justify-center flex-1 max-h-48">
          <Text className="text-4xl font-nunito-bold text-primary mb-8">
            {currentValue}
          </Text>

          <View style={{ width: TRACK_WIDTH, height: 40, justifyContent: 'center' }}>
            {/* Track Background */}
            <View className="absolute w-full h-2 bg-gray-200 rounded-full" />
            
            {/* Active Track */}
            <Animated.View 
              className="absolute h-2 bg-primary rounded-full"
              style={progressStyle}
            />

            {/* Knob */}
            <GestureDetector gesture={gesture}>
              <Animated.View
                style={[styles.knob, knobStyle]}
                className="bg-white shadow-sm border border-gray-200"
              >
                <View className="w-4 h-4 bg-primary rounded-full" />
              </Animated.View>
            </GestureDetector>
          </View>

          {labels && (
            <View className="w-full flex-row justify-between mt-4">
              <Text className="text-textSecondary font-nunito-medium text-sm">
                {labels.left}
              </Text>
              <Text className="text-textSecondary font-nunito-medium text-sm">
                {labels.right}
              </Text>
            </View>
          )}
        </View>
      </View>

      <PrimaryButton
        title="Continue"
        onPress={handleContinue}
        disabled={isAnimating}
        className="absolute bottom-10 w-full"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SliderQuestion;
