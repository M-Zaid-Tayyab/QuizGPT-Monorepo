import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

import colors from "@/app/constants/colors";

interface FeatureItemProps {
  icon: any;
  title: string;
  description?: string;
  compact?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  compact = false,
}) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    return (
      <Image
        source={icon}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
    );
  };

  if (compact) {
    return (
      <View className="flex-1 items-center p-3">
        <View
          className="w-8 h-8 rounded-lg items-center justify-center mb-2"
          style={{ backgroundColor: `${colors.primary}10` }}
        >
          {renderIcon()}
        </View>
        <Text className="text-xs font-nunito-bold text-center text-textPrimary">
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center p-3 rounded-xl mb-4 bg-white">
      <View
        className="p-2 rounded-lg items-center justify-center"
        style={{ backgroundColor: `${colors.primary}10` }}
      >
        {renderIcon()}
      </View>

      <View className="flex-1 ml-4">
        <Text className="text-xl font-nunito-bold mb-1 text-textPrimary">
          {title}
        </Text>
        {description && (
          <Text className="text-textSecondary text-md font-nunito leading-5">
            {description}
          </Text>
        )}
      </View>
    </View>
  );
};

export default FeatureItem;
