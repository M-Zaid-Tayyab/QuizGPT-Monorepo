import PrimaryButton from "@/app/components/PrimaryButton";
import { icn } from "@/assets/icn";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

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
      <Animated.View style={floatingIconStyle} className="mb-8">
        <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-pink-500 items-center justify-center shadow-2xl">
          <Image
            source={icn.logo}
            style={{ width: 140, height: 140 }}
            contentFit="contain"
          />
        </View>
      </Animated.View>
      <View className="w-full absolute bottom-safe">
        <Text className="text-4xl font-nunito-bold text-textPrimary text-center mb-4 leading-tight">
          Meet <Text className="text-primary">QuizGPT</Text>
        </Text>

        <Text className="text-xl text-textSecondary text-center font-nunito-medium mb-8 leading-6">
          QuizGPT makes studying smarter{"\n"} so exams feel less scary.
        </Text>

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
