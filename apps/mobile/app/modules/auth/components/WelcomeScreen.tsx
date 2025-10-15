import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { icn } from "@/assets/icn";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { widthPercentageToDP } from "react-native-responsive-screen";

interface WelcomeScreenProps {
  animatedStyle: any;
  floatingIconStyle: any;
  onStartOnboarding: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  animatedStyle,
  floatingIconStyle,
  onStartOnboarding,
}) => {
  return (
    <Animated.View
      style={animatedStyle}
      className="flex-1 justify-center items-center px-4"
    >
      <Animated.View style={floatingIconStyle} className="mb-10">
        <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-pink-500 items-center justify-center shadow-2xl">
          <Image
            source={icn.logo}
            style={{
              width: widthPercentageToDP(40),
              height: widthPercentageToDP(40),
            }}
            contentFit="contain"
          />
        </View>
      </Animated.View>
      <View className="w-full absolute bottom-safe">
        <Text className="text-4xl font-nunito-bold text-textPrimary text-center mb-3 leading-tight">
          Better <Text className="text-primary">grades,</Text> faster.
        </Text>

        <Text className="text-lg text-textSecondary text-center font-nunito-medium mb-5">
          Practice exam‑style questions from your materials
        </Text>

        <View className="self-center mb-7 px-4 py-2.5 rounded-full bg-primary/5 flex-row items-center justify-center">
          <Ionicons
            name="flask-outline"
            size={16}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text className="text-textPrimary font-nunito-semibold">
            Research‑backed: active recall + spaced repetition
          </Text>
        </View>

        <PrimaryButton
          title="Get Started"
          onPress={onStartOnboarding}
          className="w-full mb-4"
        />
      </View>
    </Animated.View>
  );
};

export default WelcomeScreen;
