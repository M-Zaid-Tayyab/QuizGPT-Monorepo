import { useUserStore } from "@/app/modules/auth/store/userStore";
import { useFlashcardAPI } from "@/app/modules/flashcards/hooks/useFlashcardAPI";
import { client, formDataClient } from "@/app/services";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { formatDate } from "../utils/dateUtils";
import { useDeleteDeck, useDeleteQuiz } from "./useFeedItemDelete";

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

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
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUserStore();
  const [topicText, setTopicText] = useState("");
  const [attachedFile, setAttachedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [activeCreateTab, setActiveCreateTab] = useState<"quiz" | "flashcards">(
    "flashcards"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
  const createSheetRef = useRef<BottomSheetModal>(null);

  const queryClient = useQueryClient();

  const {
    data: feedData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client.get("feed", {
        params: { page: pageParam, limit: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 0,
  });

  const {
    generateFlashcards,
    generateFlashcardsFromFile,
    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
  } = useFlashcardAPI();

  const deleteQuizMutation = useDeleteQuiz();
  const deleteDeckMutation = useDeleteDeck();

  const refreshFeed = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreFeed = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const feed: FeedItem[] = useMemo(() => {
    if (!feedData?.pages) return [];
    return feedData.pages
      .flatMap((page) => page.items)
      .map((item) => ({
        _id: item._id,
        title: item.title,
        createdAt: item.createdAt,
        formattedDate: formatDate(item.createdAt),
        type: item.type,
        raw: item,
      }));
  }, [feedData]);

  useEffect(() => {
    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => {
        if (isCreateOpen && createSheetRef.current) {
          createSheetRef.current?.snapToIndex?.(0);
        }
      }
    );
    return () => {
      keyboardWillHideListener.remove();
    };
  }, [isCreateOpen]);

  const createQuizFormData = (
    file: { uri: string; name: string; type: string },
    topic: string,
    difficulty: string,
    questionTypes: string[],
    numberOfQuestions: number,
    examType: string
  ) => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    formData.append("topic", topic);
    formData.append("difficulty", difficulty);
    formData.append("questionTypes", JSON.stringify(questionTypes));
    formData.append("numberOfQuestions", numberOfQuestions.toString());
    formData.append("examType", examType);
    return formData;
  };

  const createQuiz = async (variables: {
    topic: string;
    difficulty: string;
    questionTypes: string[];
    numberOfQuestions: number;
    examType?: string;
    file?: { uri: string; name: string; type: string } | null;
  }) => {
    const {
      topic,
      difficulty,
      questionTypes,
      numberOfQuestions,
      examType = "general",
      file,
    } = variables;

    if (file) {
      const formData = createQuizFormData(
        file,
        topic,
        difficulty,
        questionTypes,
        numberOfQuestions,
        examType
      );
      const res = await formDataClient.post("quiz/generate", formData as any);
      return res.data;
    }

    const res = await client.post("quiz/generate", {
      topic,
      difficulty,
      questionTypes,
      numberOfQuestions,
      examType,
    });
    return res.data;
  };

  const generateQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      navigation.navigate("Quiz", { quizData: data });
    },
  });

  const isGeneratingQuiz = generateQuizMutation.isPending;

  const onGenerateQuiz = useCallback(
    (
      difficulty: string,
      questionTypes: string[],
      numberOfQuestions: number,
      examType?: string
    ) => {
      if (!user?.isProUser) {
        navigation.navigate("Paywall");
        return;
      }
      const cleanTopicText =
        topicText?.trim() || (attachedFile ? "Uploaded Document" : "");
      generateQuizMutation.mutate({
        topic: cleanTopicText,
        difficulty,
        questionTypes,
        numberOfQuestions,
        examType: examType || "general",
        file: attachedFile,
      });
    },
    [topicText, attachedFile, generateQuizMutation, user, navigation]
  );

  const handleGenerateFlashcards = useCallback(
    async (data: GenerateFlashcardsData) => {
      if (!user?.isProUser) {
        navigation.navigate("Paywall");
        return;
      }
      try {
        const result = data.file
          ? await generateFlashcardsFromFile(
              data.file,
              data.text || data.category || "General",
              data.difficulty,
              data.count
            )
          : await generateFlashcards(data);

        if (result?.deck) {
          const completeDeck = {
            ...result.deck,
            flashcards: result.flashcards,
          };
          queryClient.invalidateQueries({ queryKey: ["feed"] });
          navigation.navigate("FlashcardScreen", { deck: completeDeck });
        }
      } catch (error: any) {
        console.error(
          "Error generating flashcards:",
          error?.response?.data || error?.message
        );
      }
    },
    [
      generateFlashcardsFromFile,
      generateFlashcards,
      queryClient,
      navigation,
      user,
    ]
  );

  const handleFeedItemPress = useCallback(
    (item: FeedItem) => {
      if (item.type === "quiz") {
        navigation.navigate("Quiz", {
          quizData: item.raw,
          isHistory: true,
        });
      } else {
        navigation.navigate("FlashcardScreen", { deck: item.raw });
      }
    },
    [navigation]
  );

  const onDeleteItem = useCallback(
    (item: FeedItem) => {
      if (item.type === "quiz") {
        deleteQuizMutation.mutate(item._id, {
          onSuccess: () => {
            queryClient.setQueryData(["feed"], (oldData: any) => {
              if (!oldData?.pages) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  items: page.items.filter(
                    (feedItem: any) => feedItem._id !== item._id
                  ),
                })),
              };
            });
          },
        });
      } else if (item.type === "deck") {
        deleteDeckMutation.mutate(item._id, {
          onSuccess: () => {
            queryClient.setQueryData(["feed"], (oldData: any) => {
              if (!oldData?.pages) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  items: page.items.filter(
                    (feedItem: any) => feedItem._id !== item._id
                  ),
                })),
              };
            });
          },
        });
      }
    },
    [deleteQuizMutation, deleteDeckMutation, queryClient]
  );

  const handleFileSelected = (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    setAttachedFile(file);
    setIsCreateOpen(true);
    createSheetRef.current?.present();
  };

  const cameraOptions = useMemo(
    () => ({
      mediaType: "photo" as const,
      compressImageQuality: 1.0,
      forceJpg: true,
    }),
    []
  );

  const pickFromGallery = useCallback(async () => {
    try {
      setIsFABMenuOpen(false);

      const image = await ImagePicker.openPicker({
        width: 2000,
        height: 2000,
        cropping: true,
        forceJpeg: true,
        compressImageQuality: 0.9,
        mediaType: "photo",
      });

      handleFileSelected({
        uri: image.path,
        name: image.filename || `image.jpg`,
        type: image.mime || "image/jpeg",
      });
    } catch (error) {
      console.error("Gallery picker error:", error);
    }
  }, []);

  const pickCamera = useCallback(async () => {
    try {
      setIsFABMenuOpen(false);

      const image = await ImagePicker.openCamera({
        ...cameraOptions,
      });

      if (image?.path) {
        handleFileSelected({
          uri: image.path,
          name: image.filename || `photo.jpg`,
          type: image.mime || "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Camera picker error:", error);
    }
  }, [cameraOptions]);

  const pickDocument = useCallback(async () => {
    try {
      setIsFABMenuOpen(false);

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
  }, []);

  const openCreateSheet = useCallback(() => {
    setIsFABMenuOpen(false);
    setIsCreateOpen(true);
    createSheetRef.current?.present();
  }, []);

  const fabMenuOptions = useMemo(
    () => [
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
    ],
    [pickCamera, pickFromGallery, pickDocument, openCreateSheet]
  );

  const handleRemoveFile = useCallback(() => {
    setAttachedFile(null);
  }, []);

  const handleBottomSheetChange = useCallback((index: number) => {
    setIsCreateOpen(index !== -1);
  }, []);

  const handleBottomSheetDismiss = useCallback(() => {
    setIsCreateOpen(false);
  }, []);

  const handleQuizGenerate = useCallback(
    (
      difficulty: string,
      questionTypes: string[],
      numberOfQuestions: number,
      examType?: string
    ) => {
      setIsCreateOpen(false);
      createSheetRef.current?.close();
      onGenerateQuiz(difficulty, questionTypes, numberOfQuestions, examType);
    },
    [onGenerateQuiz, createSheetRef]
  );

  const handleFlashcardsGenerate = useCallback(
    async (data: any) => {
      setIsCreateOpen(false);
      createSheetRef.current?.close();
      await handleGenerateFlashcards(data);
    },
    [handleGenerateFlashcards, createSheetRef]
  );

  const handleTabChange = useCallback((tab: "quiz" | "flashcards") => {
    setActiveCreateTab(tab);
  }, []);

  const handleOpenFABMenu = useCallback(() => {
    setIsFABMenuOpen(true);
  }, []);

  const handleCloseFABMenu = useCallback(() => {
    setIsFABMenuOpen(false);
  }, []);

  const fabButtonOpacity = useMemo(() => {
    return isCreateOpen || isFABMenuOpen || feed?.length === 0 ? 0 : 1;
  }, [isCreateOpen, isFABMenuOpen, feed]);

  const isFlashcardsGenerating = useMemo(() => {
    return (
      generateFlashcardsMutation.isPending ||
      generateFlashcardsFromFileMutation.isPending
    );
  }, [
    generateFlashcardsMutation.isPending,
    generateFlashcardsFromFileMutation.isPending,
  ]);

  const isAnyGenerating = useMemo(() => {
    return isGeneratingQuiz || isFlashcardsGenerating;
  }, [isGeneratingQuiz, isFlashcardsGenerating]);

  const createTabs = useMemo(() => ["flashcards", "quiz"] as const, []);

  return {
    topicText,
    setTopicText,
    attachedFile,
    setAttachedFile,
    activeCreateTab,
    isGeneratingQuiz,
    isRefreshing,
    isLoading,
    feed,
    isCreateOpen,
    isFABMenuOpen,
    createSheetRef,
    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
    handleFeedItemPress,
    refreshFeed,
    fabMenuOptions,
    isQuizDeleting: deleteQuizMutation.isPending,
    isDeckDeleting: deleteDeckMutation.isPending,
    handleRemoveFile,
    handleBottomSheetChange,
    handleBottomSheetDismiss,
    handleQuizGenerate,
    handleFlashcardsGenerate,
    handleTabChange,
    handleOpenFABMenu,
    handleCloseFABMenu,
    fabButtonOpacity,
    isFlashcardsGenerating,
    isAnyGenerating,
    createTabs,
    onDeleteItem,
    loadMoreFeed,
    isFetchingMoreFeed: isFetchingNextPage,
  };
};

export default useHome;
