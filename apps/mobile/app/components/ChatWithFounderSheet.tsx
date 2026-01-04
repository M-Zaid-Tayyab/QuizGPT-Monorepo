import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import BottomSheetModal from "./BottomSheetModal";

const FOUNDER_WHATSAPP = "+923466218378";
const FOUNDER_INSTAGRAM = "quizgpt_app";
const FOUNDER_EMAIL = "zaidtayyab1@gmail.com";

interface ChatOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  onPress: () => void;
}

interface ChatWithFounderSheetProps {
  onDismiss?: () => void;
}

const ChatWithFounderSheet = React.forwardRef<
  GorhomBottomSheetModal,
  ChatWithFounderSheetProps
>(({ onDismiss }, ref) => {
  // Create internal ref - always use this for the BottomSheetModal
  const internalRef = useRef<GorhomBottomSheetModal>(null);

  // Forward the internal ref to the parent ref
  React.useImperativeHandle(ref, () => internalRef.current!, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss?.();
      }
    },
    [onDismiss]
  );

  const openWhatsApp = useCallback(() => {
    const message = encodeURIComponent(
      "Hey! I'm using QuizGPT and wanted to share some feedback..."
    );
    const whatsappUrl = `whatsapp://send?phone=${FOUNDER_WHATSAPP}&text=${message}`;
    const webUrl = `https://wa.me/${FOUNDER_WHATSAPP}?text=${message}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => Linking.openURL(webUrl));
  }, []);

  const openInstagram = useCallback(() => {
    const instagramUrl = `instagram://user?username=${FOUNDER_INSTAGRAM}`;
    const webUrl = `https://instagram.com/${FOUNDER_INSTAGRAM}`;

    Linking.canOpenURL(instagramUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(instagramUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => Linking.openURL(webUrl));
  }, []);

  const openEmail = useCallback(() => {
    const subject = encodeURIComponent("QuizGPT Feedback");
    const body = encodeURIComponent(
      "Hey! I'm using QuizGPT and wanted to share some feedback...\n\n"
    );
    Linking.openURL(`mailto:${FOUNDER_EMAIL}?subject=${subject}&body=${body}`);
  }, []);

  const chatOptions: ChatOption[] = useMemo(
    () => [
      {
        id: "instagram",
        label: "Instagram",
        icon: "logo-instagram",
        iconColor: "#E4405F",
        bgColor: "bg-pink/10",
        onPress: openInstagram,
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: "chatbubble",
        iconColor: "#25D366",
        bgColor: "bg-green-500/10",
        onPress: openWhatsApp,
      },
      {
        id: "email",
        label: "Email",
        icon: "mail",
        iconColor: colors.primary,
        bgColor: "bg-primary/10",
        onPress: openEmail,
      },
    ],
    [openInstagram, openWhatsApp, openEmail]
  );

  return (
    <BottomSheetModal
      sheetRef={internalRef}
      onChange={handleSheetChanges}
      onDismiss={onDismiss}
    >
      <View className="px-5 pt-6 pb-8">
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-3">
            <Text className="text-3xl">👋</Text>
          </View>
          <Text className="text-2xl font-nunito-bold text-textPrimary text-center">
            Chat with the Founder
          </Text>
          <Text className="text-base text-textSecondary font-nunito text-center mt-2 px-2 leading-5">
            Didn&apos;t find what you expected? Not worth the money? Want
            features that actually help your grades? I read every message and
            want your honest feedback.
          </Text>
        </View>

        <View className="gap-3">
          {chatOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={option.onPress}
              className="flex-row items-center p-4 bg-white rounded-2xl border border-borderColor"
              activeOpacity={0.7}
            >
              <View
                className={`w-12 h-12 rounded-xl ${option.bgColor} items-center justify-center mr-4`}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={option.iconColor}
                />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-nunito-bold text-base">
                  {option.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheetModal>
  );
});

ChatWithFounderSheet.displayName = "ChatWithFounderSheet";

export default ChatWithFounderSheet;
