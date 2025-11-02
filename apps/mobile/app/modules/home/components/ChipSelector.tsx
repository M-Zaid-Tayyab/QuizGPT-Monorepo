import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ChipOption {
  label: string;
  value: string;
  emoji: string;
}

interface ChipSelectorProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className={clsx(
              "flex-row items-center px-4 py-2.5 rounded-xl border",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-borderColor bg-white"
            )}
            activeOpacity={0.7}
          >
            <Text className="text-base mr-2">{option.emoji}</Text>
            <Text
              className={clsx(
                "text-sm font-nunito-semibold",
                isSelected ? "text-primary" : "text-textPrimary"
              )}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ChipSelector;

