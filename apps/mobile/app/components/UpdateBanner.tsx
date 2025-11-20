import colors from "@/app/constants/colors";
import { useExpoUpdates } from "@/app/hooks/useExpoUpdates";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";

const UpdateBanner = () => {
  const { t } = useTranslation();
  const { updateInfo, reloadApp, dismissUpdate } = useExpoUpdates();

  const isVisible = updateInfo.isUpdateReady;
  const isDownloading = updateInfo.isDownloading;

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15).stiffness(100)}
      exiting={SlideOutUp.duration(300)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <View
        className="bg-primary flex-row items-center justify-between px-4 pt-safe pb-3"
        style={{
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons
            name="cloud-download-outline"
            size={24}
            color={colors.white}
          />
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold text-base">
              {isDownloading ? "Downloading Update" : "Update Available"}
            </Text>
            <Text className="text-white/80 text-xs mt-0.5">
              {isDownloading
                ? "Please wait while we download the update..."
                : "A new version of QuizGPT is available with important updates."}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {isDownloading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Pressable
                onPress={dismissUpdate}
                className="px-3 py-2"
                hitSlop={10}
              >
                <Text className="text-white/80 text-sm font-medium">Later</Text>
              </Pressable>
              <Pressable
                onPress={reloadApp}
                className="bg-white px-4 py-2 rounded-lg"
                style={{
                  shadowColor: colors.black,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  elevation: 2,
                }}
              >
                <Text className="font-bold text-sm text-primary">Reload</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default memo(UpdateBanner);
