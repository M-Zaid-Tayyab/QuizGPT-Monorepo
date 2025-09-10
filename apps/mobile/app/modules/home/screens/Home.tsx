import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import FeedbackModal from "@/app/components/FeedbackModal";
// Input is no longer used directly on this screen
import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import { client } from "@/app/services";
import { mmkv } from "@/app/storage/mmkv";
import { icn } from "@/assets/icn";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useUserStore } from "../../auth/store/userStore";
import { UploadedFile } from "../components/FileUpload";
import PromptComposer from "../components/PromptComposer";
import StreakCalendar from "../components/StreakCalendar";
// Unified input: prompt + file/image (no tabs)

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
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      quizPrompt: "",
    },
  });

  const quizPrompt = useWatch({ control, name: "quizPrompt" });
  // tracked inside PromptComposer; left here for potential analytics
  // const promptLength = (quizPrompt || "").length;
  const promptSuggestions = [
    "Algebra basics with step-by-step",
    "WW2 key events short quiz",
    "Human digestive system MCQs",
    "Python functions and loops",
  ];

  const popularTemplates = [
    {
      title: "Math Fundamentals",
      prompt: "Algebra and arithmetic basics with examples",
      emoji: "➗",
      color: "bg-primary/10",
    },
    {
      title: "History Review",
      prompt: "WW2 major events and key figures",
      emoji: "🏛️",
      color: "bg-purple/10",
    },
    {
      title: "Biology MCQs",
      prompt: "Human digestive system multiple choice",
      emoji: "🧬",
      color: "bg-green-100",
    },
    {
      title: "Python Basics",
      prompt: "Functions, loops and lists in Python",
      emoji: "🐍",
      color: "bg-yellow-100",
    },
  ];

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
    mutationFn: (data: { prompt?: string; file?: UploadedFile | null }) => {
      // If a file or image is present, send multipart including prompt (if any)
      if (data.file) {
        const formData = new FormData();
        formData.append("file", {
          uri: data.file.uri,
          type: data.file.type,
          name: data.file.name,
        } as any);
        if (data.prompt) {
          formData.append("prompt", data.prompt);
        }
        return client.post("quiz/generate", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      // Otherwise, send prompt-only query
      return client.get(
        `quiz/generate?prompt=${encodeURIComponent(data.prompt || "")}`
      );
    },
  });

  const onGenerateQuiz = (data: any) => {
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
      prompt: data.quizPrompt?.trim() || undefined,
      file: selectedFile,
    } as { prompt?: string; file?: UploadedFile | null };
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
    const hasPrompt = (quizPrompt || "").trim().length >= 3;
    return hasPrompt || !!selectedFile;
  }, [quizPrompt, selectedFile]);

  const handleFileSelect = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  // no-op

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
        <View className="mt-6">
          <Text className="text-lg font-nunito-bold text-textPrimary mb-3">
            Popular Templates
          </Text>
          <View className="flex-row flex-wrap -mx-1">
            {popularTemplates.map((t, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => reset({ quizPrompt: t.prompt })}
                className="w-1/2 px-1 mb-2"
                activeOpacity={0.85}
              >
                <View
                  className={`rounded-2xl p-4 border border-gray-100 ${t.color}`}
                >
                  <Text className="text-2xl mb-2">{t.emoji}</Text>
                  <Text className="font-nunito-semibold text-textPrimary">
                    {t.title}
                  </Text>
                  <Text
                    className="text-xs text-textSecondary font-nunito mt-1"
                    numberOfLines={2}
                  >
                    {t.prompt}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="bg-background px-4 pt-safe pb-28"
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
            Compose your prompt and attach material in one place
          </Text>

          <Controller
            control={control}
            name="quizPrompt"
            render={({ field: { onChange, value } }) => (
              <PromptComposer
                prompt={value}
                onPromptChange={onChange}
                onClearPrompt={() => reset({ quizPrompt: "" })}
                suggestions={promptSuggestions}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                className="mt-6"
              />
            )}
          />
        </View>
      </KeyboardAwareScrollView>

      <View className="px-4 pb-safe pt-3 bg-background/95 border-t border-gray-100 absolute bottom-0 left-0 right-0">
        <PrimaryButton
          title={quizMutation.isPending ? "Generating..." : "Generate Quiz"}
          onPress={handleSubmit(onGenerateQuiz)}
          leftIcon={icn.generate}
          className=""
          disabled={!showGenerateButton || quizMutation.isPending}
        />
        {!showGenerateButton && (
          <Text className="text-center text-textSecondary text-xs font-nunito mt-2">
            Enter a prompt or attach a file/image to continue
          </Text>
        )}
      </View>

      <AnimatedLoadingModal isVisible={quizMutation.isPending} />
      <FeedbackModal
        isVisible={showFeedbackModal}
        onClose={handleFeedbackModalClose}
      />
    </View>
  );
};

export default Home;
