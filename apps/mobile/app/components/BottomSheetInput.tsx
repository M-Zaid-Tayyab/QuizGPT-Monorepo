import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React from "react";
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
  ...props
}) => {
  return (
    <View className={` ${containerClassName}`}>
      <View
        className={`flex-row items-center px-4 rounded-lg bg-white min-h-12 ${
          error ? "border border-red" : borderColor ? "border" : ""
        }`}
        style={
          borderColor && !error
            ? { borderColor: borderColor, borderWidth: 2 }
            : undefined
        }
      >
        {leftComponent && <View className="mr-2">{leftComponent}</View>}

        <BottomSheetTextInput
          className={`
            flex-1
            font-sfPro text-base text-text
            ${inputClassName}
          `}
          placeholderTextColor={colors.textSecondary}
          style={
            Platform.OS === "android"
              ? {
                  textAlignVertical: "center",
                  includeFontPadding: false,
                  paddingVertical: 0,
                }
              : {
                  lineHeight: 0,
                }
          }
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
