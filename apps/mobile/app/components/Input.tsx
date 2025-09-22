import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ImageStyle,
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { icn } from "@/assets/icn";
import clsx from "clsx";
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
  className,
  inputClassName,
  autoFocus,
  leftIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePassword = () => setIsPasswordVisible((prev) => !prev);
  const containerStyle: StyleProp<ViewStyle> = [
    typeof width === "number" ? { width } : {},
    style,
  ];

  return (
    <View
      className={`flex-row items-center border rounded-lg px-3 py-2 bg-white h-12
        ${className} ${
        error
          ? "border-red-500"
          : isFocused
          ? "border-primary"
          : "border-borderColor"
      } ${borderLess ? "border-0" : ""}`}
      style={containerStyle}
      onLayout={onLayout}
    >
      {leftIcon && leftIcon()}
      <TextInput
        className={clsx(
          "flex-1 text-base text-textPrimary font-nunito py-0 h-full",
          inputClassName
        )}
        style={[
          Platform.OS === "android"
            ? {
                textAlignVertical: "center",
                includeFontPadding: false,
                paddingVertical: 0,
              }
            : {
                lineHeight: 0,
              },
          inputStyle,
        ]}
        onChangeText={onChangeText}
        value={value}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || colors.textSecondary}
        cursorColor={colors.textPrimary}
        onFocus={() => {
          if (!disabled) {
            setIsFocused(true);
            onFocus && onFocus();
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur && onBlur();
        }}
        maxLength={numberOfCharacter}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        secureTextEntry={type === "password" && !isPasswordVisible}
        autoFocus={autoFocus}
      />
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
      {rightButton ? rightButton() ?? null : null}
      {error && errorMessage && (
        <Text className="text-xs text-red-500 absolute left-0 -bottom-5 ml-1">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({});

export default Input;
