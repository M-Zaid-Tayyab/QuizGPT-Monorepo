import React from "react";
import { ActivityIndicator, Modal, Platform, Text, View } from "react-native";
import colors from "../constants/colors";

interface Props {
  isVisible: boolean;
  message?: string;
}
const LoadingModal = ({ isVisible, message }: Props) => {
  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      <View className="absolute inset-0 flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl p-6 w-2/5 max-w-sm items-center">
          <ActivityIndicator
            size={Platform.OS === "ios" ? "large" : 40}
            color={colors.textPrimary}
          />
          <Text className="text-textPrimary text-base leading-5 font-nunito-bold mt-4 text-center">
            {message ? message : "Please wait ..."}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;
