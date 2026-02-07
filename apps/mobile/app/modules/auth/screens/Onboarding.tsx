import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  ChipsQuestion,
  MultiSelectQuestion,
  OnboardingAhaScreen,
  ProgressBar,
  QuestionCard,
  ReviewRequestScreen,
  SliderQuestion,
  TextInputQuestion,
  WelcomeScreen,
} from "../components";
import { useOnboarding } from "../hooks/useOnboarding";
import { useUserStore } from "../store/userStore";

const Onboarding: React.FC = () => {
  const {
    showWelcome,
    currentQuestionIndex,
    currentAnswer,
    isAnimating,
    questions,
    handleStartOnboarding,
    handleAnswer,
    handleToggleAnswer,
    handleNext,
    progressBarAnimatedStyle,
    cardAnimatedStyle,
    iconAnimatedStyle,
    welcomeAnimatedStyle,
    floatingIconStyle,
    getOptionAnimatedStyle,
    isUpdatingUser,
    showReviewScreen,
    showAhaScreen,
    onAhaComplete,
    previewResultRef,
    createOnboardingPayload,
    fetchOnboardingPreview,
    requestStoreReview,
    handleOnboarding,
  } = useOnboarding();
  const { user } = useUserStore();

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];

    switch (question.type) {
      case "slider":
        return (
          <SliderQuestion
            question={question.question}
            subtitle={question.subtitle}
            icon={question.icon}
            iconColor={question.iconColor}
            min={question.min || 1}
            max={question.max || 10}
            step={question.step || 1}
            labels={question.sliderLabels}
            cardAnimatedStyle={cardAnimatedStyle}
            iconAnimatedStyle={iconAnimatedStyle}
            onAnswer={handleNext}
            isAnimating={isAnimating}
          />
        );
      case "multiple":
        const multiAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <MultiSelectQuestion
            question={question}
            questionIndex={currentQuestionIndex}
            selectedAnswers={multiAnswers}
            isAnimating={isAnimating}
            cardAnimatedStyle={cardAnimatedStyle}
            iconAnimatedStyle={iconAnimatedStyle}
            getOptionAnimatedStyle={getOptionAnimatedStyle}
            onToggleAnswer={handleToggleAnswer}
            onContinue={() => handleNext()}
          />
        );
      case "chips":
        const chipsAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <ChipsQuestion
            question={question}
            selectedAnswers={chipsAnswers}
            isAnimating={isAnimating}
            cardAnimatedStyle={cardAnimatedStyle}
            iconAnimatedStyle={iconAnimatedStyle}
            onToggleAnswer={handleToggleAnswer}
            onContinue={() => handleNext()}
          />
        );
      case "text":
        return (
          <TextInputQuestion
            question={question.question}
            subtitle={question.subtitle}
            icon={question.icon}
            iconColor={question.iconColor}
            placeholder={question.placeholder || ""}
            keyboardType={question.keyboardType}
            maxLength={question.maxLength}
            cardAnimatedStyle={cardAnimatedStyle}
            iconAnimatedStyle={iconAnimatedStyle}
            onAnswer={handleNext}
            isAnimating={isAnimating}
          />
        );
      case "single":
      default:
        const singleAnswer =
          typeof currentAnswer === "string" ? currentAnswer : null;
        return (
          <QuestionCard
            question={question}
            questionIndex={currentQuestionIndex}
            selectedAnswer={singleAnswer}
            isAnimating={isAnimating}
            cardAnimatedStyle={cardAnimatedStyle}
            iconAnimatedStyle={iconAnimatedStyle}
            getOptionAnimatedStyle={getOptionAnimatedStyle}
            onAnswer={handleAnswer}
          />
        );
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-grow py-safe"
      bounces={false}
    >
      {showWelcome && !user?.token ? (
        <WelcomeScreen
          animatedStyle={welcomeAnimatedStyle}
          floatingIconStyle={floatingIconStyle}
          onStartOnboarding={handleStartOnboarding}
        />
      ) : showAhaScreen ? (
        <OnboardingAhaScreen
          cachedPreview={previewResultRef.current}
          onComplete={onAhaComplete}
          fetchPreview={fetchOnboardingPreview}
          fullPayload={createOnboardingPayload()}
        />
      ) : showReviewScreen ? (
        <ReviewRequestScreen
          onReview={requestStoreReview}
          onComplete={handleOnboarding}
        />
      ) : (
        <>
          <ProgressBar
            currentStep={currentQuestionIndex}
            totalSteps={questions.length}
            animatedStyle={progressBarAnimatedStyle}
          />

          <View className="flex-1 px-4">{renderQuestion()}</View>
        </>
      )}
      <AnimatedLoadingModal
        isVisible={isUpdatingUser}
        messages={["Making personalizations", "Almost there"]}
      />
    </KeyboardAwareScrollView>
  );
};

export default Onboarding;
