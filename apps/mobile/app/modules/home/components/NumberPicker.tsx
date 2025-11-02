import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

const NumberPicker: React.FC<NumberPickerProps> = ({
  value,
  onChange,
  min = 1,
  max = 50,
  label,
}) => {
  return (
    <View className="flex-row items-center justify-center mt-6">
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        className={clsx(
          "w-12 h-12 rounded-2xl items-center justify-center",
          value <= min ? "bg-gray-100" : "bg-greyBackground"
        )}
        disabled={value <= min}
      >
        <Ionicons
          name="remove"
          size={18}
          color={value <= min ? "#9CA3AF" : colors.black}
        />
      </TouchableOpacity>

      <View className="flex-1 items-center mx-8">
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-2">
          <Text className="text-2xl font-nunito-bold text-primary">{value}</Text>
        </View>
        <Text className="text-sm font-nunito text-textSecondary">{label}</Text>
      </View>

      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + 1))}
        className={clsx(
          "w-12 h-12 rounded-2xl items-center justify-center",
          value >= max ? "bg-gray-100" : "bg-green-100"
        )}
        disabled={value >= max}
      >
        <Ionicons
          name="add"
          size={18}
          color={value >= max ? "#9CA3AF" : "#10B981"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default NumberPicker;

