import { Image } from "expo-image";
import React from "react";
import {
  ImageStyle,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

export interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  withArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  icnStyle?: StyleProp<ImageStyle>;
  animating?: boolean;
  textStyle?: StyleProp<TextStyle>;
  icon?: any;
  leftIcon?: any;
  disabled?: boolean;
  whiteBackground?: boolean;
  leftIcnStyle?: StyleProp<ImageStyle>;
  disabledWhileAnimating?: boolean;
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  withArrow,
  style,
  icnStyle,
  animating,
  textStyle,
  icon,
  leftIcon,
  disabled,
  whiteBackground,
  leftIcnStyle,
  disabledWhileAnimating,
  className,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-lg py-4 px-4 ${className} ${
        disabled ? "opacity-50" : "bg-primary"
      } ${whiteBackground ? "bg-white" : "bg-primary"}`}
      style={style}
      onPress={() => {
        if (
          disabled === true ||
          (animating === true && disabledWhileAnimating === true)
        ) {
          return;
        } else onPress();
      }}
    >
      {leftIcon && (
        <Image
          source={leftIcon}
          style={[
            { width: 20, height: 20, marginRight: 8 } as ImageStyle,
            leftIcnStyle,
          ]}
          contentFit="contain"
        />
      )}
      <Text className="text-white text-base font-semibold" style={textStyle}>
        {title}
      </Text>
      {icon && (
        <Image
          source={icon}
          style={[
            { width: 20, height: 20, marginLeft: 8 } as ImageStyle,
            icnStyle,
          ]}
          contentFit="contain"
        />
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
