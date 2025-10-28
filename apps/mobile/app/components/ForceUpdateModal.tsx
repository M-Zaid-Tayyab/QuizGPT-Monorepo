import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, View } from "react-native";

import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";

interface ForceUpdateModalProps {
  visible: boolean;
  onUpdate: () => void;
  versionInfo?: {
    currentVersion: string;
    minimumVersion: string;
    latestVersion: string;
  } | null;
}

const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  visible,
  onUpdate,
  versionInfo,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Ionicons
                name="arrow-up-circle"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text className="text-textPrimary text-2xl font-nunito-bold text-center">
              Update Required
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-textSecondary text-base font-nunito text-center leading-6 mb-4">
              A new version of QuizGPT is available with important updates and
              bug fixes.
            </Text>

            {versionInfo && (
              <View className="bg-gray-50 rounded-lg p-3 mb-4">
                <Text className="text-textSecondary text-sm font-nunito text-center">
                  Current Version: {versionInfo.currentVersion}
                </Text>
                <Text className="text-textSecondary text-sm font-nunito text-center">
                  Latest Version: {versionInfo.latestVersion}
                </Text>
              </View>
            )}

            <Text className="text-textSecondary text-sm font-nunito text-center">
              Please update to continue using the app.
            </Text>
          </View>

          <View className="space-y-3">
            <PrimaryButton title="Update Now" onPress={onUpdate} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ForceUpdateModal;
