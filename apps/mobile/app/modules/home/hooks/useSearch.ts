import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { client } from "@/app/services";
import { useDeleteDeck, useDeleteQuiz } from "./useFeedItemDelete";
import type { FeedItem } from "./useHome";

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

export const useSearch = () => {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const deleteQuizMutation = useDeleteQuiz();
  const deleteDeckMutation = useDeleteDeck();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return { results: [], count: 0 };
      }
      const response = await client.get("search", {
        params: { q: debouncedQuery.trim() },
      });
      return response.data;
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 0,
  });

  const refreshFeed = async () => {
    await refetch();
  };

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
            queryClient.invalidateQueries({ queryKey: ["search"] });
          },
        });
      } else if (item.type === "deck") {
        deleteDeckMutation.mutate(item._id, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["search"] });
          },
        });
      }
    },
    [deleteQuizMutation, deleteDeckMutation, queryClient]
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const filteredFeed: FeedItem[] = (searchResults?.results || []).map(
    (item: any) => ({
      ...item,
      formattedDate: formatDate(item.createdAt),
    })
  ) as FeedItem[];

  return {
    searchQuery,
    setSearchQuery,
    isLoading,
    filteredFeed,
    handleFeedItemPress,
    onDeleteItem,
    refreshFeed,
    isQuizDeleting: deleteQuizMutation.isPending,
    isDeckDeleting: deleteDeckMutation.isPending,
  };
};

export default useSearch;
