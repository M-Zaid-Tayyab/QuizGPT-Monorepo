import BottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import useQuiz from "../../home/hooks/useQuiz";
import {
  ExplanationButton,
  ExplanationSheet,
  QuizHeader,
  QuizProgressBar,
  QuizQuestion,
  QuizResults,
  ReportButton,
  ReportModal,
  SkipMessage,
} from "../components";
import { useQuizGame } from "../hooks/useQuizGame";

const Quiz: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const reportModalRef = useRef<BottomSheet>(null);
  const explanationSheetRef = useRef<BottomSheet>(null);
  const [isClearingExplanation, setIsClearingExplanation] = useState(false);

  const {
    quizData,
    isHistory,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswer,
    isAnswerSubmitted,
    showResults,
    containerWidth,
    skippedQuestions,
    showSkipMessage,
    historyScore,
    handleAnswerSelect,
    handleTextAnswer,
    handleNextQuestion,
    handleGoHome,
    handleReport,
    setContainerWidth,
    progressBarAnimatedStyle,
    questionAnimatedStyle,
    getOptionAnimatedStyle,
    onContinueLearning,
    moreQuestionsMutation,
  } = useQuizGame();

  const { explanationMutation } = useQuiz();

  const handleOpenExplanation = () => {
    if (!quizData?._id) return;

    setIsClearingExplanation(true);
    queryClient.removeQueries({ queryKey: ["explanation"] });
    explanationMutation.reset();

    const correctAnswerIndex = currentQuestion
      ? typeof currentQuestion.correctAnswer === "number"
        ? currentQuestion.correctAnswer
        : parseInt(currentQuestion.correctAnswer as any, 10)
      : null;
    explanationSheetRef.current?.expand();
    explanationMutation.mutate(
      {
        quizId: quizData._id,
        questionIndex: currentQuestionIndex?.toString(),
        selectedAnswerIndex: selectedAnswer?.toString(),
        correctAnswerIndex: correctAnswerIndex?.toString(),
      },
      {
        onSuccess: (response) => {
          setIsClearingExplanation(false);
        },
        onError: (error) => {
          console.log("Error: ", error);
          setIsClearingExplanation(false);
        },
      }
    );
  };

  const handleOpenReport = () => {
    reportModalRef.current?.expand();
  };

  if (showResults) {
    return (
      <QuizResults
        score={historyScore}
        totalQuestions={quizData?.questions?.length || 0}
        skippedQuestions={skippedQuestions}
        isHistory={isHistory}
        onGoHome={handleGoHome}
        onContinueLearning={onContinueLearning}
        isLoading={moreQuestionsMutation.isPending}
      />
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <View className="flex-1 bg-background py-safe px-4 justify-center items-center">
        <Text className="text-lg text-textPrimary">Loading quiz...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background py-safe px-4">
      <QuizHeader
        description={quizData.title}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={quizData.questions.length}
        onBackPress={() => (navigation as any).goBack()}
      />

      <QuizProgressBar animatedStyle={progressBarAnimatedStyle} />

      <SkipMessage isVisible={showSkipMessage} />

      <View className="flex-1 overflow-hidden justify-center">
        <Animated.View
          className="flex-row"
          style={[
            questionAnimatedStyle,
            {
              width:
                containerWidth > 0
                  ? containerWidth * quizData.questions.length
                  : "100%",
              minHeight: 200,
            },
          ]}
        >
          {quizData.questions.map((question, qIndex) => (
            <View
              key={qIndex}
              style={{
                width: containerWidth > 0 ? containerWidth : "100%",
                minHeight: 200,
              }}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                if (width > 0 && containerWidth !== width) {
                  setContainerWidth(width);
                }
              }}
            >
              <QuizQuestion
                question={question}
                questionIndex={qIndex}
                currentQuestionIndex={currentQuestionIndex}
                selectedAnswer={selectedAnswer}
                isAnswerSubmitted={isAnswerSubmitted}
                isHistory={isHistory}
                skippedQuestions={skippedQuestions}
                getOptionAnimatedStyle={getOptionAnimatedStyle}
                onAnswerSelect={handleAnswerSelect}
                onTextAnswer={handleTextAnswer}
                onNextQuestion={handleNextQuestion}
                totalQuestions={quizData.questions.length}
              />
            </View>
          ))}
        </Animated.View>
        {!isHistory && isAnswerSubmitted && (
          <ExplanationButton onPress={handleOpenExplanation} />
        )}
      </View>

      {!isHistory && (
        <ReportButton
          isReported={skippedQuestions.has(currentQuestionIndex)}
          onPress={handleOpenReport}
        />
      )}

      <ReportModal bottomSheetRef={reportModalRef} onReport={handleReport} />
      <ExplanationSheet
        bottomSheetRef={explanationSheetRef}
        isLoading={explanationMutation.isPending || isClearingExplanation}
        error={(explanationMutation.error as any)?.response?.data?.message}
        explanation={
          isClearingExplanation || explanationMutation.isPending
            ? null
            : (explanationMutation.data as any)?.data?.explanation
        }
      />
    </View>
  );
};

export default Quiz;
