import clsx from "clsx";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  withArrow?: boolean;
  animating?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  disabledWhileAnimating?: boolean;
  className?: string;
  textClassName?: string;
  style?: any;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  animating,
  icon,
  leftIcon,
  disabled,
  disabledWhileAnimating,
  className,
  textClassName,
  style,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      className={clsx(
        `flex-row items-center justify-center rounded-xl py-4 px-4 bg-primary`,
        className,
        {
          "opacity-50": disabled,
        }
      )}
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
      {leftIcon && leftIcon}
      <Text className={clsx(`text-white text-lg font-semibold`, textClassName)}>
        {title}
      </Text>
      {icon && icon}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
