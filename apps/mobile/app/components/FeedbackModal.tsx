import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  instagramUrl?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isVisible,
  onClose,
  title = "We're Here for You!",
  subtitle = "Have any issues, ideas, or feedback? We'd love to hear from you! You can also find this option in Settings anytime.",
  instagramUrl = "https://www.instagram.com/quizgpt_app?igsh=OWVvNGR2Y2ZlbjV2",
}) => {
  const handleInstagramPress = async () => {
    try {
      const supported = await Linking.canOpenURL(instagramUrl);
      if (supported) {
        await Linking.openURL(instagramUrl);
      } else {
        Alert.alert(
          "Instagram Not Available",
          "Please make sure Instagram is installed on your device."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open Instagram. Please try again later.");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-3xl shadow-2xl overflow-hidden w-[90%]">
          <View className=" py-8 relative bg-white">
            <TouchableOpacity
              onPress={handleClose}
              className="absolute top-6 right-6 w-10 h-10 bg-greyBackground/40 backdrop-blur-sm rounded-full items-center justify-center border border-white/30"
              activeOpacity={0.8}
              hitSlop={10}
            >
              <Ionicons name="close" size={20} color={colors.black} />
            </TouchableOpacity>

            <View className="items-center mt-4">
              <View className="w-16 h-16 bg-primary/25 backdrop-blur-sm rounded-full items-center justify-center border border-white/30 shadow-lg">
                <Ionicons
                  name="chatbubble-ellipses"
                  size={36}
                  color={colors.primary}
                />
              </View>

              <Text className="text-textPrimary text-2xl font-nunito-bold text-center leading-7 mt-4">
                {title}
              </Text>
              <Text className="text-textSecondary text-center font-nunito text-base leading-6 mt-3 max-w-xs">
                {subtitle}
              </Text>
            </View>
          </View>

          <View className="px-4 py-8">
            <TouchableOpacity
              onPress={handleInstagramPress}
              className="relative overflow-hidden rounded-2xl shadow-lg active:scale-95"
              activeOpacity={0.9}
            >
              <View className="bg-primary p-3 shadow-xl">
                <View className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />

                <View className="flex-row items-center justify-between">
                  <View className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl items-center justify-center border border-white/30 shadow-md">
                    <Ionicons
                      name="logo-instagram"
                      size={32}
                      color={colors.white}
                    />
                  </View>

                  <View className="flex-1 items-center">
                    <Text className="text-white font-nunito-bold text-lg">
                      Contact Us on Instagram
                    </Text>
                    <Text className="text-white font-nunito text-sm text-center">
                      Our CEO personally responds to every message on Instagram!
                    </Text>
                  </View>

                  <View className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full items-center justify-center border border-white/30 shadow-md">
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={colors.white}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
