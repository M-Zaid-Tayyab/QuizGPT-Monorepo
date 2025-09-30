import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  ProgressBar,
  QuestionCard,
  TextInputQuestion,
  WelcomeScreen,
} from "../components";
import { useOnboarding } from "../hooks/useOnboarding";

const Onboarding: React.FC = () => {
  const {
    showWelcome,
    currentQuestionIndex,
    selectedAnswer,
    isAnimating,
    questions,
    registerMutation,
    handleStartOnboarding,
    handleAnswer,
    progressBarAnimatedStyle,
    cardAnimatedStyle,
    iconAnimatedStyle,
    welcomeAnimatedStyle,
    floatingIconStyle,
    getOptionAnimatedStyle,
  } = useOnboarding();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-grow py-safe"
      bounces={false}
    >
      {showWelcome ? (
        <WelcomeScreen
          animatedStyle={welcomeAnimatedStyle}
          floatingIconStyle={floatingIconStyle}
          onStartOnboarding={handleStartOnboarding}
        />
      ) : (
        <>
          <ProgressBar
            currentStep={currentQuestionIndex}
            totalSteps={questions.length}
            animatedStyle={progressBarAnimatedStyle}
          />

          <View className="flex-1 px-4">
            {questions[currentQuestionIndex].isTextInput ? (
              <TextInputQuestion
                question={questions[currentQuestionIndex].question}
                subtitle={questions[currentQuestionIndex].subtitle}
                icon={questions[currentQuestionIndex].icon}
                iconColor={questions[currentQuestionIndex].iconColor}
                placeholder={questions[currentQuestionIndex].placeholder || ""}
                keyboardType={questions[currentQuestionIndex].keyboardType}
                maxLength={questions[currentQuestionIndex].maxLength}
                cardAnimatedStyle={cardAnimatedStyle}
                iconAnimatedStyle={iconAnimatedStyle}
                onAnswer={(value) => handleAnswer(value, 0)}
                isAnimating={isAnimating}
              />
            ) : (
              <QuestionCard
                question={questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                selectedAnswer={selectedAnswer}
                isAnimating={isAnimating}
                cardAnimatedStyle={cardAnimatedStyle}
                iconAnimatedStyle={iconAnimatedStyle}
                getOptionAnimatedStyle={getOptionAnimatedStyle}
                onAnswer={handleAnswer}
              />
            )}
          </View>
        </>
      )}

      <AnimatedLoadingModal
        isVisible={registerMutation.isPending}
        messageInterval={1500}
        messages={["Getting things ready", "Almost there"]}
      />
    </KeyboardAwareScrollView>
  );
};

export default Onboarding;
