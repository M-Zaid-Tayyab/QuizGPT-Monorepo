import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { OnboardingConfig } from "./useOnboardingConfig";

interface AnimationValues {
  progressBar: any;
  optionScales: any;
  optionOpacities: any;
  cardScale: any;
  cardOpacity: any;
  iconRotation: any;
  welcomeOpacity: any;
  welcomeScale: any;
  welcomeTranslateY: any;
  floatingIconY: any;
}

interface AnimationStyles {
  progressBarAnimatedStyle: any;
  cardAnimatedStyle: any;
  iconAnimatedStyle: any;
  welcomeAnimatedStyle: any;
  floatingIconStyle: any;
  getOptionAnimatedStyle: (index: number) => any;
}

export const useOnboardingAnimations = (config: OnboardingConfig) => {
  const animationValues: AnimationValues = {
    progressBar: useSharedValue(0),
    optionScales: useSharedValue(new Array(config.maxOptions).fill(1)),
    optionOpacities: useSharedValue(new Array(config.maxOptions).fill(1)),
    cardScale: useSharedValue(1),
    cardOpacity: useSharedValue(1),
    iconRotation: useSharedValue(0),
    welcomeOpacity: useSharedValue(0),
    welcomeScale: useSharedValue(0.8),
    welcomeTranslateY: useSharedValue(50),
    floatingIconY: useSharedValue(0),
  };

  const resetOptionAnimations = useCallback(() => {
    animationValues.optionScales.value = new Array(config.maxOptions).fill(1);
    animationValues.optionOpacities.value = new Array(config.maxOptions).fill(
      1
    );
  }, [
    animationValues.optionScales,
    animationValues.optionOpacities,
    config.maxOptions,
  ]);

  const animateOptionSelection = useCallback(
    (optionIndex: number, totalOptions: number) => {
      const newScales = new Array(totalOptions).fill(1);
      const newOpacities = new Array(totalOptions).fill(0.6);

      newScales[optionIndex] = 1.05;
      newOpacities[optionIndex] = 1;

      animationValues.optionScales.value = withSpring(newScales, {
        damping: config.animationSettings.damping,
      });
      animationValues.optionOpacities.value = withTiming(newOpacities, {
        duration: config.animationDurations.option,
      });
    },
    [animationValues.optionScales, animationValues.optionOpacities, config]
  );

  const animateWelcome = useCallback(() => {
    animationValues.welcomeOpacity.value = withTiming(1, {
      duration: config.animationDurations.welcome,
    });
    animationValues.welcomeScale.value = withSpring(1, {
      damping: config.animationSettings.damping,
      stiffness: config.animationSettings.stiffness,
    });
    animationValues.welcomeTranslateY.value = withSpring(0, {
      damping: config.animationSettings.damping,
      stiffness: config.animationSettings.stiffness,
    });
    animationValues.floatingIconY.value = withRepeat(
      withTiming(-20, { duration: 2000 }),
      -1,
      true
    );
  }, [animationValues, config]);

  const animateWelcomeExit = useCallback(() => {
    animationValues.welcomeOpacity.value = withTiming(0, {
      duration: 400,
    });
    animationValues.welcomeScale.value = withSpring(0.8, {
      damping: config.animationSettings.damping,
    });
    animationValues.welcomeTranslateY.value = withSpring(-50, {
      damping: config.animationSettings.damping,
    });
  }, [animationValues, config]);

  const animateProgress = useCallback(
    (currentIndex: number, totalQuestions: number) => {
      animationValues.progressBar.value = withSpring(
        (currentIndex + 1) / totalQuestions,
        {
          damping: config.animationSettings.damping,
          stiffness: config.animationSettings.stiffness,
        }
      );
    },
    [animationValues.progressBar, config]
  );

  const animateCardTransition = useCallback(() => {
    animationValues.cardScale.value = withSpring(1, {
      damping: config.animationSettings.damping,
      stiffness: config.animationSettings.stiffness,
    });
    animationValues.cardOpacity.value = withTiming(1, {
      duration: config.animationDurations.card,
    });
    animationValues.iconRotation.value = withSpring(360, {
      damping: config.animationSettings.damping,
      stiffness: config.animationSettings.stiffness,
    });
  }, [animationValues, config]);

  const animateCardSelection = useCallback(() => {
    animationValues.cardScale.value = withSpring(0.95, {
      damping: config.animationSettings.damping,
    });
    animationValues.cardOpacity.value = withTiming(1, {
      duration: config.animationDurations.card,
    });
  }, [animationValues, config]);

  const progressBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${animationValues.progressBar.value * 100}%`,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValues.cardScale.value }],
    opacity: animationValues.cardOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animationValues.iconRotation.value}deg` }],
  }));

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animationValues.welcomeOpacity.value,
    transform: [
      { scale: animationValues.welcomeScale.value },
      { translateY: animationValues.welcomeTranslateY.value },
    ],
  }));

  const floatingIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animationValues.floatingIconY.value }],
  }));

  const option0AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValues.optionScales.value[0] || 1 }],
    opacity: animationValues.optionOpacities.value[0] || 1,
  }));

  const option1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValues.optionScales.value[1] || 1 }],
    opacity: animationValues.optionOpacities.value[1] || 1,
  }));

  const option2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValues.optionScales.value[2] || 1 }],
    opacity: animationValues.optionOpacities.value[2] || 1,
  }));

  const option3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValues.optionScales.value[3] || 1 }],
    opacity: animationValues.optionOpacities.value[3] || 1,
  }));

  const option4AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValues.optionScales.value[4] || 1 }],
    opacity: animationValues.optionOpacities.value[4] || 1,
  }));

  const getOptionAnimatedStyle = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          return option0AnimatedStyle;
        case 1:
          return option1AnimatedStyle;
        case 2:
          return option2AnimatedStyle;
        case 3:
          return option3AnimatedStyle;
        case 4:
          return option4AnimatedStyle;
        default:
          return option0AnimatedStyle;
      }
    },
    [
      option0AnimatedStyle,
      option1AnimatedStyle,
      option2AnimatedStyle,
      option3AnimatedStyle,
      option4AnimatedStyle,
    ]
  );

  const animationStyles: AnimationStyles = {
    progressBarAnimatedStyle,
    cardAnimatedStyle,
    iconAnimatedStyle,
    welcomeAnimatedStyle,
    floatingIconStyle,
    getOptionAnimatedStyle,
  };

  return {
    animationValues,
    animationStyles,
    resetOptionAnimations,
    animateOptionSelection,
    animateWelcome,
    animateWelcomeExit,
    animateProgress,
    animateCardTransition,
    animateCardSelection,
  };
};
