import { useUserStore } from "@/app/modules/auth/store/userStore";
import { useFlashcardAPI } from "@/app/modules/flashcards/hooks/useFlashcardAPI";
import { client } from "@/app/services";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useRef, useState } from "react";

export type FeedItem = {
  _id: string;
  title: string;
  createdAt: string;
  formattedDate: string;
  type: "quiz" | "deck";
  raw: any;
};

export interface GenerateFlashcardsData {
  text: string;
  category: string;
  count: number;
  difficulty: string;
  file?: {
    uri: string;
    name: string;
    type: string;
  };
}

export const useHome = () => {
  const navigation = useNavigation();
  const {
    user,
    hasUsedFreeQuiz,
    hasUsedFreeDeck,
    setHasUsedFreeQuiz,
    setHasUsedFreeDeck,
    setLastQuizDate,
    setQuizCount,
    quizCount,
  } = useUserStore();

  const [topicText, setTopicText] = useState("");
  const [attachedFile, setAttachedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [activeCreateTab, setActiveCreateTab] = useState<"quiz" | "flashcards">(
    "quiz"
  );
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
  const createSheetRef = useRef<BottomSheetModal>(null);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["history"],
    queryFn: async () => (await client.get("quiz/history")).data,
    staleTime: 0,
  });

  const {
    useUserDecks,
    generateFlashcards,
    generateFlashcardsFromFile,
    queryClient,
    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
  } = useFlashcardAPI();
  const { data: decksData, isLoading: decksLoading } = useUserDecks();

  const isLoading = historyLoading || decksLoading;

  const refreshFeed = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["history"] }),
        queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const feed: FeedItem[] = useMemo(() => {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    const quizItems: FeedItem[] = (history?.quizzes || []).map(
      (quiz: {
        _id: string;
        title?: string;
        description?: string;
        createdAt: string;
      }) => ({
        _id: quiz._id,
        title: quiz.title?.trim() || quiz.description?.trim() || "Quiz",
        createdAt: quiz.createdAt,
        formattedDate: formatDate(quiz.createdAt),
        type: "quiz" as const,
        raw: quiz,
      })
    );
    const deckItems: FeedItem[] = (decksData?.decks || []).map(
      (deck: { _id: string; name: string; createdAt: string }) => ({
        _id: deck._id,
        title: deck.name,
        createdAt: deck.createdAt,
        formattedDate: formatDate(deck.createdAt),
        type: "deck" as const,
        raw: deck,
      })
    );
    return [...quizItems, ...deckItems].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });
  }, [history, decksData]);

  const onGenerateQuiz = (
    difficulty: string,
    questionTypes: string[],
    numberOfQuestions: number,
    examType?: string
  ) => {
    if (!user?.isProUser && hasUsedFreeQuiz) {
      (navigation as any).navigate("Paywall");
      return;
    }

    const cleanTopicText =
      topicText?.trim() || (attachedFile ? "Uploaded Document" : "");

    const form = attachedFile
      ? (() => {
          const fd = new FormData();
          fd.append("file", {
            uri: attachedFile.uri,
            type: attachedFile.type,
            name: attachedFile.name,
          } as any);
          fd.append("topic", cleanTopicText);
          fd.append("difficulty", difficulty);
          fd.append("questionTypes", JSON.stringify(questionTypes));
          fd.append("numberOfQuestions", numberOfQuestions.toString());
          fd.append("examType", examType || "general");
          return fd;
        })()
      : null;

    setIsGeneratingQuiz(true);
    const req = attachedFile
      ? client.post("quiz/generate", form as any, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : client.post("quiz/generate", {
          topic: cleanTopicText,
          difficulty,
          questionTypes,
          numberOfQuestions,
          examType: examType || "general",
        });

    req
      .then((res) => {
        setLastQuizDate(new Date().toISOString());
        setQuizCount(quizCount + 1);
        if (!user?.isProUser && !hasUsedFreeQuiz) setHasUsedFreeQuiz(true);
        queryClient.invalidateQueries({ queryKey: ["history"] });
        (navigation as any).navigate("Quiz", { quizData: res.data });
      })
      .finally(() => {
        setIsGeneratingQuiz(false);
      });
  };

  const handleGenerateFlashcards = async (data: GenerateFlashcardsData) => {
    try {
      if (!user?.isProUser && hasUsedFreeDeck) {
        (navigation as any).navigate("Paywall");
        return;
      }
      const result = data.file
        ? await generateFlashcardsFromFile(
            data.file,
            data.text || data.category || "General",
            data.difficulty,
            data.count
          )
        : await generateFlashcards(data);

      if (result?.deck) {
        queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
        if (!user?.isProUser && !hasUsedFreeDeck) setHasUsedFreeDeck(true);
        (navigation as any).navigate("FlashcardScreen", { deck: result.deck });
        queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      }
    } catch (error: any) {
      console.error(
        "Error generating flashcards:",
        error?.response?.data || error?.message
      );
    }
  };

  const handleFeedItemPress = (item: FeedItem) => {
    if (item.type === "quiz") {
      (navigation as any).navigate("Quiz", {
        quizData: item.raw,
        isHistory: true,
      });
    } else {
      (navigation as any).navigate("FlashcardScreen", { deck: item.raw });
    }
  };

  const closeMenuAndWait = async () => {
    setIsFABMenuOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const handleFileSelected = (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    setAttachedFile(file);
    setIsCreateOpen(true);
    createSheetRef.current?.present();
  };

  const pickFromGallery = async () => {
    try {
      await closeMenuAndWait();

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        selectionLimit: 1,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        handleFileSelected({
          uri: asset.uri,
          name: asset.fileName || "image.jpg",
          type: asset.mimeType || "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Gallery picker error:", error);
    }
  };

  const pickCamera = async () => {
    try {
      await closeMenuAndWait();

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        selectionLimit: 1,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        handleFileSelected({
          uri: asset.uri,
          name: asset.fileName || "photo.jpg",
          type: asset.mimeType || "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Camera picker error:", error);
    }
  };

  const pickDocument = async () => {
    try {
      await closeMenuAndWait();

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        handleFileSelected({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
        });
      }
    } catch (error) {
      console.error("Document picker error:", error);
    }
  };

  const openCreateSheet = () => {
    setIsFABMenuOpen(false);
    setIsCreateOpen(true);
    createSheetRef.current?.present();
  };

  const fabMenuOptions = [
    {
      id: "camera",
      label: "Camera",
      icon: "camera",
      iconType: "ionicons" as const,
      onPress: pickCamera,
    },
    {
      id: "photos",
      label: "Photos",
      icon: "images",
      iconType: "ionicons" as const,
      onPress: pickFromGallery,
    },
    {
      id: "file",
      label: "File upload",
      icon: "file-document-outline",
      iconType: "material" as const,
      onPress: pickDocument,
    },
    {
      id: "type",
      label: "Type",
      icon: "create",
      iconType: "ionicons" as const,
      onPress: openCreateSheet,
    },
  ];

  return {
    topicText,
    setTopicText,
    attachedFile,
    setAttachedFile,
    activeCreateTab,
    setActiveCreateTab,
    isGeneratingQuiz,
    isRefreshing,
    isLoading,
    feed,
    isCreateOpen,
    setIsCreateOpen,
    isFABMenuOpen,
    setIsFABMenuOpen,
    createSheetRef,
    onGenerateQuiz,
    handleGenerateFlashcards,
    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
    handleFeedItemPress,
    refreshFeed,
    fabMenuOptions,
  };
};

export default useHome;
