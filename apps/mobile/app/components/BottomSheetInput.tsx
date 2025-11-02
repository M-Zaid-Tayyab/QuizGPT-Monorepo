import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { clsx } from "clsx";
import React, { useState } from "react";
import { Platform, Text, TextInputProps, View } from "react-native";
import colors from "../constants/colors";

export interface BottomSheetInputProps extends TextInputProps {
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  borderColor?: string;
}

export const BottomSheetInput: React.FC<BottomSheetInputProps> = ({
  error,
  containerClassName = "",
  inputClassName = "",
  errorClassName = "",
  leftComponent,
  rightComponent,
  borderColor,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View className={clsx(containerClassName)}>
      <View
        className={clsx(
          "px-4 rounded-lg bg-white border min-h-12",
          props.multiline ? "items-start pt-1" : "flex-row items-center",
          error && "border-red",
          !error && isFocused && "border-primary",
          !error && !isFocused && !borderColor && "border-borderColor"
        )}
        style={
          borderColor && !error && !isFocused
            ? { borderColor: borderColor, borderWidth: 1 }
            : undefined
        }
      >
        {leftComponent && <View className="mr-2">{leftComponent}</View>}

        <BottomSheetTextInput
          className={clsx(
            "flex-1 font-sfPro text-base text-text",
            inputClassName
          )}
          placeholderTextColor={colors.textSecondary}
          style={[
            Platform.OS === "android"
              ? {
                  textAlignVertical: props.multiline ? "top" : "center",
                  includeFontPadding: false,
                  paddingVertical: props.multiline ? 0 : 0,
                }
              : {
                  lineHeight: props.multiline ? undefined : 0,
                },
            props.style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {rightComponent && rightComponent}
      </View>

      {error && (
        <Text className={`mt-1 text-red font-sfPro ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  );
};
