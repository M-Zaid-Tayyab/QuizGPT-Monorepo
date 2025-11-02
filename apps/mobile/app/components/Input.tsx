import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ImageStyle,
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { icn } from "@/assets/icn";
import { clsx } from "clsx";
import colors from "../../app/constants/colors";

export interface InputProps {
  onChangeText?: (text: string) => void;
  error?: boolean;
  errorMessage?: string;
  placeholder?: string;
  type?: "password" | "email" | "text";
  icon?: boolean;
  renderIcon?: () => void;
  showError?: boolean;
  multiline?: boolean;
  numberOfCharacter?: number;
  keyboardType?: KeyboardTypeOptions;
  width?: number | string;
  inputStyle?: StyleProp<TextStyle>;
  value?: string;
  onLayout?: (e: any) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  allowClear?: boolean;
  rightButton?: () => React.ReactNode;
  rightIcon?: any;
  onBlur?: () => void;
  borderLess?: boolean;
  placeholderTextColor?: string;
  onFocus?: () => void;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  leftIcon?: () => React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  onChangeText,
  error,
  errorMessage,
  placeholder,
  type = "text",
  icon,
  renderIcon,
  showError,
  multiline,
  numberOfCharacter,
  keyboardType,
  width = "100%",
  inputStyle,
  value,
  onLayout,
  style,
  disabled,
  allowClear,
  rightButton,
  rightIcon,
  onBlur,
  borderLess,
  placeholderTextColor,
  onFocus,
  className = "",
  inputClassName = "",
  autoFocus,
  leftIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePassword = () => setIsPasswordVisible((prev) => !prev);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (!disabled) {
      setIsFocused(true);
      onFocus?.();
    }
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.();
  };

  // Determine error state (support both error boolean and errorMessage string)
  const hasError = error || (errorMessage && errorMessage.length > 0);
  const errorText = typeof errorMessage === "string" ? errorMessage : undefined;

  // Build right component - password toggle, rightIcon, or rightButton
  const rightComponent = (
    <>
      {type === "password" && (
        <Pressable onPress={togglePassword} className="ml-2">
          <Image
            source={isPasswordVisible ? icn.eye : icn.eyeCrossed}
            style={{ width: 20, height: 20 } as ImageStyle}
            contentFit="contain"
            tintColor={colors.textSecondary}
          />
        </Pressable>
      )}
      {rightIcon && (
        <Image
          source={rightIcon}
          style={{ width: 20, height: 20, marginLeft: 8 } as ImageStyle}
          contentFit="contain"
        />
      )}
      {rightButton && rightButton()}
    </>
  );

  // Build left component
  const leftComponent = leftIcon ? (
    <View className="mr-2">{leftIcon()}</View>
  ) : null;

  const containerStyle: StyleProp<ViewStyle> = [
    typeof width === "number" ? { width } : {},
    style,
  ];

  return (
    <View
      className={clsx(className)}
      style={containerStyle}
      onLayout={onLayout}
    >
      <View
        className={clsx(
          "px-4 rounded-lg bg-white border min-h-12",
          multiline ? "items-start pt-1" : "flex-row items-center",
          !borderLess && hasError && "border-red",
          !borderLess && !hasError && isFocused && "border-primary",
          !borderLess && !hasError && !isFocused && "border-borderColor",
          borderLess && "border-0"
        )}
      >
        {leftComponent}

        <TextInput
          className={clsx(
            "flex-1 font-nunito text-base text-textPrimary",
            inputClassName
          )}
          placeholderTextColor={placeholderTextColor || colors.textSecondary}
          cursorColor={colors.textPrimary}
          style={[
            Platform.OS === "android"
              ? {
                  textAlignVertical: multiline ? "top" : "center",
                  includeFontPadding: false,
                  paddingVertical: multiline ? 0 : 0,
                }
              : {
                  lineHeight: multiline ? undefined : 0,
                },
            inputStyle,
          ]}
          onChangeText={onChangeText}
          value={value}
          multiline={multiline}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={numberOfCharacter}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          secureTextEntry={type === "password" && !isPasswordVisible}
          autoFocus={autoFocus}
        />

        {rightComponent}
      </View>

      {hasError && errorText && (
        <Text className="mt-1 text-red font-nunito">{errorText}</Text>
      )}
    </View>
  );
};

export default Input;
