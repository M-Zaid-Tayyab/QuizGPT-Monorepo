import React, { useEffect, useState } from "react";
import { Image, Modal, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  isVisible: boolean;
  messages?: string[];
  messageInterval?: number;
}

const AnimatedLoadingModal = ({
  isVisible,
  messages = [
    "Analyzing your request",
    "Making personalizations",
    "Crafting unique questions",
    "Almost there",
  ],
  messageInterval = 2000,
}: Props) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const messageOpacity = useSharedValue(1);
  const containerScale = useSharedValue(0.8);

  const iconY = useSharedValue(0);
  const iconShadowOpacity = useSharedValue(0.3);
  const iconGlowScale = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      rotation.value = withRepeat(
        withSpring(360, { damping: 15, stiffness: 100 }),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 8, stiffness: 100 }),
          withSpring(0.95, { damping: 8, stiffness: 100 }),
          withSpring(1.05, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 8, stiffness: 100 })
        ),
        -1,
        true
      );

      iconY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500 }),
          withTiming(8, { duration: 1500 })
        ),
        -1,
        true
      );

      iconGlowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      );

      iconShadowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1200 }),
          withTiming(0.2, { duration: 1200 })
        ),
        -1,
        true
      );

      opacity.value = withTiming(1, { duration: 400 });
      containerScale.value = withTiming(1, { duration: 400 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      containerScale.value = withTiming(0.8, { duration: 300 });
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || messages.length <= 1) return;

    const interval = setInterval(() => {
      messageOpacity.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );

      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 200);
    }, messageInterval);

    return () => clearInterval(interval);
  }, [isVisible, messages, messageInterval]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
      { translateY: iconY.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconGlowScale.value }],
    opacity: iconShadowOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const resetAnimation = () => {
    rotation.value = 0;
    scale.value = 1;
    opacity.value = 0;
    messageOpacity.value = 1;
    containerScale.value = 0.8;
    iconY.value = 0;
    iconShadowOpacity.value = 0.3;
    iconGlowScale.value = 1;

    setCurrentMessageIndex(0);
  };

  const currentMessage = messages[currentMessageIndex] || messages[0];

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onDismiss={resetAnimation}
    >
      <View className="absolute inset-0 flex-1 justify-center items-center bg-black/40">
        <Animated.View
          style={containerAnimatedStyle}
          className="relative w-[85%] max-w-sm items-center"
        >
          <View className="relative p-8 items-center">
            <Animated.View style={iconAnimatedStyle} className="mb-6">
              <View className="relative">
                <Animated.View
                  style={glowAnimatedStyle}
                  className="absolute inset-0 bg-primary rounded-3xl blur-2xl"
                />

                <View className="absolute inset-0 bg-white rounded-3xl blur-xl" />

                <Image
                  source={require("../../assets/icons/icon.png")}
                  className="w-20 h-20 rounded-3xl"
                  resizeMode="cover"
                />
              </View>
            </Animated.View>

            <Animated.View style={messageAnimatedStyle} className="w-full mb-6">
              <Text className="text-2xl font-nunito-bold text-center text-white">
                {currentMessage}
              </Text>
            </Animated.View>

            <View className="flex-row">
              {messages.map((_, index) => (
                <View
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full mx-1 ${
                    index === currentMessageIndex ? "bg-primary" : "bg-white"
                  }`}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AnimatedLoadingModal;
