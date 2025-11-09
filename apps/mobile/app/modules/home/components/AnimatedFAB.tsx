import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

interface AnimatedFABProps {
  visible: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  visible,
  onPress,
  icon = "add",
  iconSize = 38,
}) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={ZoomIn.duration(200)}
      exiting={ZoomOut.duration(150)}
      className="absolute right-5 bottom-12 z-10"
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="p-4 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name={icon} size={iconSize} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedFAB;
