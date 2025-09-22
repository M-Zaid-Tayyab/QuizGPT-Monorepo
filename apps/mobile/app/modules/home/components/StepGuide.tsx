import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface StepGuideProps {
  className?: string;
}

const StepGuide: React.FC<StepGuideProps> = ({ className }) => {
  const steps = [
    {
      icon: "document-outline",
      title: "Upload",
      description: "Your syllabus, notes, or study guide",
      color: colors.primary,
    },
    {
      icon: "chatbubble-outline",
      title: "Tell Us",
      description: "What to focus on or make harder",
      color: colors.success,
    },
    {
      icon: "trophy-outline",
      title: "Get",
      description: "A custom practice exam",
      color: colors.orange,
    },
  ];

  return (
    <View className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
      <Text className="text-lg font-nunito-bold text-textPrimary text-center mb-4">
        How It Works
      </Text>

      <View className="flex-row justify-between">
        {steps.map((step, index) => (
          <View key={index} className="flex-1 items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: `${step.color}20` }}
            >
              <Ionicons name={step.icon as any} size={24} color={step.color} />
            </View>
            <Text className="text-sm font-nunito-bold text-textPrimary text-center mb-1">
              {step.title}
            </Text>
            <Text className="text-xs font-nunito text-textSecondary text-center leading-4">
              {step.description}
            </Text>
            {index < steps.length - 1 && (
              <View className="absolute -right-4 top-6">
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default StepGuide;
