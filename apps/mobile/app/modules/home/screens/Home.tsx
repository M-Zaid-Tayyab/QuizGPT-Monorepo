import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import FeedbackModal from "@/app/components/FeedbackModal";
import Input from "@/app/components/Input";
import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import { client } from "@/app/services";
import { mmkv } from "@/app/storage/mmkv";
import { icn } from "@/assets/icn";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { customEvent } from "vexo-analytics";
import { useUserStore } from "../../auth/store/userStore";
import FileUpload, { UploadedFile } from "../components/FileUpload";
import StreakCalendar from "../components/StreakCalendar";
import TabSelector from "../components/TabSelector";

type ActiveTab = "prompt" | "file";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("file");
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      quizPrompt: "",
    },
  });

  const getUser = async () => {
    const response = await client.get("auth/user");
    return response.data;
  };

  const queryClient = useQueryClient();

  const { data: latestUser, isLoading } = useQuery({
    queryKey: ["user", user?.token],
    queryFn: getUser,
    retry: false,
    throwOnError: (error) => {
      if (error?.response?.status === 401) {
        mmkv.clearAll();
        logout();
        queryClient.clear();
        navigation.reset({
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
  }, [latestUser]);

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
    mutationFn: (data: { prompt?: string; file?: UploadedFile }) => {
      if (data.file) {
        const formData = new FormData();
        formData.append("file", {
          uri: data.file.uri,
          type: data.file.type,
          name: data.file.name,
        } as any);
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

  const onGenerateQuiz = (data: any) => {
    if (!isProUser && quizCount >= latestUser?.quizLimit && !!lastQuizDate) {
      const lastQuizDateObj = new Date(lastQuizDate);
      const currentDate = new Date();
      const diffTime = currentDate.getTime() - lastQuizDateObj.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);

      if (diffHours < 24) {
        navigation.navigate("Paywall");
        return;
      }
    }

    let payload = {};
    if (activeTab === "prompt") {
      payload = {
        prompt: data.quizPrompt,
      };
    } else {
      payload = {
        file: selectedFile,
      };
    }
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

  const showGenerateButton = useMemo(() => {
    return activeTab === "prompt" ? true : !!selectedFile;
  }, [activeTab, selectedFile]);

  const handleFileSelect = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
      customEvent("Home_Quiz_Tab_Changed_To", { tab });
      reset();
      setSelectedFile(null);
    },
    [reset, setSelectedFile, setActiveTab]
  );

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
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="bg-background px-4 pt-safe flex-grow"
      showsVerticalScrollIndicator={false}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
    >
      <StreakCalendar user={user} className="mt-4" />

      <View className="mt-8">
        <Text className="text-2xl font-nunito-bold text-textPrimary">
          Create Your Quiz
        </Text>
        <Text className="text-textSecondary font-nunito text-base mt-2">
          Choose how you&apos;d like to generate your quiz
        </Text>

        <TabSelector
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mt-4"
        />

        {activeTab === "prompt" ? (
          <View className="bg-white rounded-xl shadow-sm mt-6 p-4">
            <View className="flex-row items-center">
              <View className="bg-primary/10 rounded-lg p-2 mr-3">
                <Text className="text-2xl">💭</Text>
              </View>
              <View>
                <Text className="text-lg font-nunito-bold text-textPrimary">
                  Text Prompt
                </Text>
                <Text className="text-textSecondary font-nunito text-sm">
                  Describe what you want to learn about
                </Text>
              </View>
            </View>

            <Controller
              control={control}
              name="quizPrompt"
              rules={{
                required: "Please enter some words for the quiz",
                minLength: {
                  value: 3,
                  message: "Please enter at least 3 characters",
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <>
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Quiz me on solving linear equations step by step, Test my knowledge of common English spelling rules, Test my understanding of the human digestive system..."
                    multiline
                    numberOfCharacter={10000}
                    className="h-52 py-3 mt-6"
                    inputClassName="h-full"
                    inputStyle={{
                      textAlignVertical: "top",
                    }}
                  />
                  {error && (
                    <Text className="text-red text-sm mb-4 font-nunito">
                      {error.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        ) : (
          <View className="bg-white rounded-xl mt-6 shadow-sm p-4">
            <View className="flex-row items-center">
              <View className="bg-primary/10 rounded-lg mr-3 p-1">
                <Text className="text-2xl">📄</Text>
              </View>
              <View>
                <Text className="text-lg font-nunito-bold text-textPrimary">
                  File Upload
                </Text>
                <Text className="text-textSecondary font-nunito text-sm">
                  Upload a PDF or image to generate quiz from content
                </Text>
              </View>
            </View>

            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              className="mt-6"
            />
          </View>
        )}
      </View>
      {showGenerateButton && (
        <PrimaryButton
          title={"Generate Quiz"}
          onPress={handleSubmit(onGenerateQuiz)}
          leftIcon={icn.generate}
          className="mt-10 mb-3"
        />
      )}
      <AnimatedLoadingModal isVisible={quizMutation.isPending} />
      <FeedbackModal
        isVisible={showFeedbackModal}
        onClose={handleFeedbackModalClose}
      />
    </KeyboardAwareScrollView>
  );
};

export default Home;
