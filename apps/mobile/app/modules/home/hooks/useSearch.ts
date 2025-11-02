import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { client } from "@/app/services";
import type { FeedItem } from "./useHome";

export const useSearch = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query (300ms delay)
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
    refreshFeed,
  };
};

export default useSearch;
