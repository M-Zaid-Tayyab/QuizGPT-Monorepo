import { icn } from "@/assets/icn";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

interface PaywallHeaderProps {
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const PaywallHeader: React.FC<PaywallHeaderProps> = ({
  title = "Unlock Premium Features",
  subtitle = "Get unlimited access to all features and create unlimited quizzes",
  showCloseButton = true,
  onClose,
}) => {
  return (
    <View className="px-6 pt-2 pb-4">
      {showCloseButton && (
        <View className="flex-row justify-end mb-2">
          <Text
            onPress={onClose}
            className="text-textSecondary text-lg font-nunito-medium"
          >
            ✕
          </Text>
        </View>
      )}

      <View className="items-center mb-4">
        <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-3">
          <Image
            source={icn.generate}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        </View>

        <Text className="text-textPrimary text-xl font-nunito-bold text-center mb-1">
          {title}
        </Text>

        <Text className="text-textSecondary text-sm font-nunito text-center leading-5">
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

export default PaywallHeader;
