import React from "react";
import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className,
}) => {
  return (
    <View className={className}>
      <Text className="text-base font-nunito-semibold text-textPrimary mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-sm font-nunito text-textSecondary mb-4">
          {description}
        </Text>
      )}
    </View>
  );
};

export default SectionHeader;

