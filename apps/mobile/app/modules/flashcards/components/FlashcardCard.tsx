import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface FlashcardCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  cardTranslateY: Animated.Value;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({
  flashcard,
  isFlipped,
  onFlip,
  onNext,
  onPrevious,
  cardTranslateY,
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get("window");
  const initialHint = useRef(new Animated.Value(0)).current;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return colors.success;
      case "Medium":
        return colors.warning;
      case "Hard":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const flipCard = () => {
    const next = isFlipped ? 0 : 1;
    Haptics.selectionAsync();
    Animated.timing(flipAnimation, {
      toValue: next,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onFlip();
    });
  };

  // Initial flip hint micro-animation on first mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(initialHint, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(initialHint, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initialHint]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const cardTransformFront = useMemo(
    () => [
      { perspective: 1000 },
      { rotateY: frontInterpolate },
      { scale: pressScale },
      { translateX },
      { translateY: cardTranslateY },
    ],
    [frontInterpolate, pressScale, translateX, cardTranslateY]
  );

  const cardTransformBack = useMemo(
    () => [
      { perspective: 1000 },
      { rotateY: backInterpolate },
      { scale: pressScale },
      { translateX },
      { translateY: cardTranslateY },
    ],
    [backInterpolate, pressScale, translateX, cardTranslateY]
  );

  const hintTransform = useMemo(
    () => [
      { perspective: 1000 },
      {
        rotateY: initialHint.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "10deg"],
        }),
      },
      {
        scale: initialHint.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.995],
        }),
      },
      {
        translateY: initialHint.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 4],
        }),
      },
    ],
    [initialHint]
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) < 10,
      onPanResponderGrant: () => {
        Animated.spring(pressScale, {
          toValue: 0.98,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        Animated.spring(pressScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        const threshold = width * 0.2;
        if (gesture.dx > threshold) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateX.setValue(0);
            opacity.setValue(1);
            onPrevious();
          });
        } else if (gesture.dx < -threshold) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateX.setValue(0);
            opacity.setValue(1);
            onNext();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View className="flex-1 justify-center px-2">
      <View {...panResponder.panHandlers} className="rounded-2xl min-h-80">
        {/* Next-card peek affordance behind */}
        <Animated.View
          pointerEvents="none"
          className="rounded-2xl"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: 12,
            height: 280,
            backgroundColor: colors.white,
            borderRadius: 20,
            opacity: 0.4,
            transform: [{ scale: 0.96 }, { translateY: 12 }],
            shadowColor: colors.shadow,
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        />
        <TouchableOpacity
          onPress={flipCard}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={isFlipped ? "Hide answer" : "Reveal answer"}
          accessibilityHint={
            isFlipped
              ? "Tap to flip back to the question"
              : "Tap to flip and see the answer"
          }
        >
          <View style={{ height: 280 }}>
            {/* Front */}
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                opacity,
                transform: isFlipped
                  ? cardTransformFront
                  : [...cardTransformFront, ...hintTransform],
                backfaceVisibility: "hidden" as any,
                shadowColor: colors.shadow,
                shadowOpacity: 0.2,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }}
              className="bg-white rounded-2xl p-6 justify-center"
            >
              <View className="items-center">
                <View className="flex-row items-center mb-6">
                  <View
                    className="px-3 py-1.5 rounded-full mr-3"
                    style={{
                      backgroundColor:
                        getDifficultyColor(flashcard.difficulty) + "15",
                    }}
                  >
                    <Text
                      className="text-xs font-nunito-bold"
                      style={{
                        color: getDifficultyColor(flashcard.difficulty),
                      }}
                    >
                      {flashcard.difficulty}
                    </Text>
                  </View>
                  <Text className="text-textSecondary font-nunito-medium text-sm">
                    {flashcard.category}
                  </Text>
                </View>

                <Text className="text-textPrimary text-2xl font-nunito-bold text-center leading-8 mb-8">
                  {flashcard.front}
                </Text>

                <View className="items-center">
                  <View className="bg-primary/10 rounded-full p-3 mb-2">
                    <Ionicons
                      name="arrow-down"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text className="text-textSecondary font-nunito-medium text-sm text-center">
                    Tap to reveal answer
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Back */}
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                opacity,
                transform: cardTransformBack,
                backfaceVisibility: "hidden" as any,
                shadowColor: colors.shadow,
                shadowOpacity: 0.2,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }}
              className="bg-white rounded-2xl p-6 justify-center"
            >
              <View className="items-center">
                <View className="flex-row items-center mb-6">
                  <View
                    className="px-3 py-1.5 rounded-full mr-3"
                    style={{
                      backgroundColor:
                        getDifficultyColor(flashcard.difficulty) + "15",
                    }}
                  >
                    <Text
                      className="text-xs font-nunito-bold"
                      style={{
                        color: getDifficultyColor(flashcard.difficulty),
                      }}
                    >
                      {flashcard.difficulty}
                    </Text>
                  </View>
                  <Text className="text-textSecondary font-nunito-medium text-sm">
                    {flashcard.category}
                  </Text>
                </View>

                <Text className="text-textPrimary text-xl font-nunito text-center leading-7 mb-6">
                  {flashcard.back}
                </Text>

                {flashcard.tags.length > 0 && (
                  <View className="flex-row flex-wrap justify-center gap-2">
                    {flashcard.tags.map((tag, index) => (
                      <View
                        key={index}
                        className="bg-primary/10 px-3 py-1.5 rounded-full"
                      >
                        <Text className="text-primary font-nunito-medium text-xs">
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FlashcardCard;
