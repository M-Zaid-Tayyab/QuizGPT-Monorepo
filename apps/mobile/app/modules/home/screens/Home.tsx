import React, { useEffect, useState } from "react";
import { View } from "react-native";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import FeedbackModal from "@/app/components/FeedbackModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import { client } from "@/app/services";
import { mmkv } from "@/app/storage/mmkv";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { customEvent } from "vexo-analytics";
import { useUserStore } from "../../auth/store/userStore";
import { StepGuide, StreakCalendar } from "../components";
import FilePickerModal from "../components/FilePickerModal";
import QuizRequestInterface from "../components/QuizRequestInterface";

const Home: React.FC = () => {
  const navigation = useNavigation();
  const {
    user,
    setUser,
    logout,
    quizCount,
    setQuizCount,
    lastQuizDate,
    setLastQuizDate,
    isProUser,
  } = useUserStore();
  const [requestText, setRequestText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

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
    mutationFn: (data: { prompt: string; file?: any }) => {
      if (data.file) {
        const formData = new FormData();
        formData.append("file", {
          uri: data.file.uri,
          type: data.file.type,
          name: data.file.name,
        } as any);
        formData.append("prompt", data.prompt);
        return client.post("quiz/generate", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        return client.get(`quiz/generate?prompt=${data.prompt}`);
      }
    },
  });

  const onGenerateQuiz = () => {
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
    };

    quizMutation.mutate(payload, {
      onSuccess: (data) => {
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
          <SkeletonPlaceholder className="w-64 h-8 rounded-lg mb-2" />
          <SkeletonPlaceholder className="w-80 h-5 rounded-lg mb-8" />
          <SkeletonPlaceholder className="w-full h-14 rounded-xl mb-8" />
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <SkeletonPlaceholder className="w-48 h-6 rounded-lg mb-4" />
            <SkeletonPlaceholder className="w-full h-64 rounded-xl mb-6" />
            <SkeletonPlaceholder className="w-full h-14 rounded-xl" />
          </View>
        </View>
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
        onPress={onGenerateQuiz}
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
    </View>
  );
};

export default Home;
