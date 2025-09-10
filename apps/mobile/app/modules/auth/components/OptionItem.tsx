import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface Option {
  label: string;
  value: string;
  icon: string;
  color: string;
  description?: string;
}

interface OptionItemProps {
  option: Option;
  optionIndex: number;
  questionIndex: number;
  isSelected: boolean;
  isAnimating: boolean;
  animatedStyle: any;
  onPress: (value: string, index: number) => void;
}

const OptionItem: React.FC<OptionItemProps> = ({
  option,
  optionIndex,
  questionIndex,
  isSelected,
  isAnimating,
  animatedStyle,
  onPress,
}) => {
  return (
    <Animated.View
      key={`${questionIndex}-${optionIndex}`}
      style={animatedStyle}
      className="my-3"
    >
      <TouchableOpacity
        className={`p-4 rounded-xl ${
          isSelected
            ? "bg-primary border-primary shadow-lg"
            : "bg-white border-gray-200 shadow-sm"
        }`}
        onPress={() => onPress(option.value, optionIndex)}
        disabled={isAnimating}
      >
        <View className="flex-row items-center">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
              isSelected ? "bg-white" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={option.color}
            />
          </View>
          <View className="flex-1">
            <Text
              className={`text-lg font-nunito-bold ${
                isSelected ? "text-white" : "text-textPrimary"
              }`}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text
                className={`text-sm font-nunito-medium mt-1 ${
                  isSelected ? "text-white" : "text-textSecondary"
                }`}
              >
                {option.description}
              </Text>
            )}
          </View>
          {isSelected && (
            <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
              <Ionicons name="checkmark" size={16} color={colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OptionItem;
