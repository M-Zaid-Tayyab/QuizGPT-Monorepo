import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import FeedbackModal from "@/app/components/FeedbackModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import { client } from "@/app/services";
import { mmkv } from "@/app/storage/mmkv";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { customEvent } from "vexo-analytics";
import { useUserStore } from "../../auth/store/userStore";
import { StepGuide, StreakCalendar } from "../components";
import FilePickerModal from "../components/FilePickerModal";
import QuizPreferencesSheet from "../components/QuizPreferencesSheet";
import QuizRequestInterface from "../components/QuizRequestInterface";

const Home: React.FC = () => {
  const navigation = useNavigation();
  const {
    user,
    setUser,
    logout,
    quizCount,
    setQuizCount,
    setLastQuizDate,
    isProUser,
    lastQuizDate,
  } = useUserStore();
  const [requestText, setRequestText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const quizPreferencesRef = useRef<BottomSheetModal>(null);

  const getUser = async () => {
    const response = await client.get("auth/user");
    return response.data;
  };

  const queryClient = useQueryClient();

  const { data: latestUser, isLoading } = useQuery({
    queryKey: ["user", user?.token],
    queryFn: getUser,
    retry: false,
    throwOnError: (error: any) => {
      if (error?.response?.status === 401) {
        mmkv.clearAll();
        logout();
        queryClient.clear();
        (navigation as any).reset({
          index: 0,
          routes: [{ name: "Auth" }],
        });
      }
      return false;
    },
  });

  useEffect(() => {
    if (latestUser && !isLoading) {
      const userData = latestUser.user || latestUser;
      const updatedUser = {
        ...userData,
        token: user?.token,
      };
      setUser(updatedUser);
    }
  }, [latestUser, isLoading, setUser, user?.token]);

  useEffect(() => {
    const hasSeenFeedback = mmkv.getBoolean("hasSeenFeedbackModal");
    if (!hasSeenFeedback) {
      const timer = setTimeout(() => {
        setShowFeedbackModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFeedbackModalClose = () => {
    setShowFeedbackModal(false);
    mmkv.set("hasSeenFeedbackModal", true);
  };

  const quizMutation = useMutation({
    mutationFn: (data: {
      prompt: string;
      file?: any;
      difficulty: string;
      questionTypes: string[];
      numberOfQuestions: number;
    }) => {
      if (data.file) {
        const formData = new FormData();
        formData.append("file", {
          uri: data.file.uri,
          type: data.file.type,
          name: data.file.name,
        } as any);
        formData.append("topic", data.prompt);
        formData.append("difficulty", data.difficulty);
        formData.append("questionTypes", JSON.stringify(data.questionTypes));
        formData.append("numberOfQuestions", data.numberOfQuestions.toString());

        return client.post("quiz/generate", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        return client.post("quiz/generate", {
          topic: data.prompt,
          difficulty: data.difficulty,
          questionTypes: data.questionTypes,
          numberOfQuestions: data.numberOfQuestions,
        });
      }
    },
  });

  const onGenerateQuiz = (
    difficulty: string,
    questionTypes: string[],
    numberOfQuestions: number
  ) => {
    if (!isProUser && quizCount >= latestUser?.quizLimit && !!lastQuizDate) {
      const lastQuizDateObj = new Date(lastQuizDate);
      const currentDate = new Date();
      const diffTime = currentDate.getTime() - lastQuizDateObj.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);

      if (diffHours < 24) {
        (navigation as any).navigate("Paywall");
        return;
      }
    }

    const payload = {
      prompt: requestText,
      file: attachedFile,
      difficulty,
      questionTypes,
      numberOfQuestions,
    };

    quizMutation.mutate(payload, {
      onSuccess: (data) => {
        console.log("Generated Quiz: ", JSON.stringify(data.data));
        setLastQuizDate(new Date().toISOString());
        setQuizCount(quizCount + 1);
        (navigation as any).navigate("Quiz", { quizData: data.data });
      },
      onError: (error: any) => {
        console.log(error?.response?.data);
        Toast.show({
          text1: error?.response?.data?.message,
          type: "error",
        });
      },
    });
  };

  const handleQuizPreferencesClose = () => {
    quizPreferencesRef.current?.close();
  };

  const handleFileSelect = (file: any) => {
    setAttachedFile(file);
    customEvent("Home_File_Attached", { fileType: file.type });
  };

  const handleFileRemove = () => {
    setAttachedFile(null);
    customEvent("Home_File_Removed", {});
  };

  const handleTextChange = (text: string) => {
    setRequestText(text);
  };

  const handleExampleSelect = (example: string) => {
    setRequestText(example);
    customEvent("Home_Example_Selected", { example });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background pt-safe px-4">
        <View className="flex-1">
          <View className="bg-white rounded-2xl shadow-sm p-4 mt-6 mb-8">
            <SkeletonPlaceholder className="w-full h-24 rounded-xl" />
          </View>
          <SkeletonPlaceholder className="w-64 h-8 rounded-lg mb-2 mt-2" />
          <SkeletonPlaceholder className="w-full h-14 rounded-xl mb-8" />
          <View className="bg-white rounded-2xl shadow-sm p-4 mt-6">
            <SkeletonPlaceholder className="w-full h-64 rounded-xl mb-6" />
          </View>
        </View>
        <SkeletonPlaceholder className="w-full h-16 rounded-lg self-center absolute bottom-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pt-safe">
      <KeyboardAwareScrollView
        contentContainerClassName="px-4 flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        enableOnAndroid
      >
        <StreakCalendar user={user} className="mb-6" />
        <StepGuide className="mb-6" />
        <QuizRequestInterface
          requestText={requestText}
          onTextChange={handleTextChange}
          attachedFile={attachedFile}
          onFileRemove={handleFileRemove}
          onFilePickerOpen={() => setShowFilePicker(true)}
          onExampleSelect={handleExampleSelect}
        />
      </KeyboardAwareScrollView>
      <PrimaryButton
        title="✨ Generate Quiz"
        onPress={() => quizPreferencesRef.current?.present()}
        disabled={quizMutation.isPending || requestText.trim().length === 0}
        className="my-4 mx-4"
      />

      <AnimatedLoadingModal isVisible={quizMutation.isPending} />
      <FeedbackModal
        isVisible={showFeedbackModal}
        onClose={handleFeedbackModalClose}
      />
      <FilePickerModal
        isVisible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFileSelect={handleFileSelect}
      />
      <QuizPreferencesSheet
        sheetRef={quizPreferencesRef}
        onGenerateQuiz={onGenerateQuiz}
        onClose={handleQuizPreferencesClose}
        topic={requestText}
        attachedFile={attachedFile}
      />
    </View>
  );
};

export default Home;
