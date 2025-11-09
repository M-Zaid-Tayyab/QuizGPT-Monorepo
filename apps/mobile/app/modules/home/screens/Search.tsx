import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Text, View } from "react-native";

import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import colors from "@/app/constants/colors";
import type { FeedItem } from "@/app/modules/home/hooks/useHome";
import { useSearch } from "@/app/modules/home/hooks/useSearch";
import { FlashList } from "@shopify/flash-list";
import SearchHeader from "../components/SearchHeader";
import SwipeableFeedItem from "../components/SwipeableFeedItem";

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

const Search: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    searchQuery,
    setSearchQuery,
    isLoading,
    filteredFeed,
    handleFeedItemPress,
    onDeleteItem,
  } = useSearch();

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      return (
        <SwipeableFeedItem
          item={item}
          onPress={handleFeedItemPress}
          onDelete={onDeleteItem}
        />
      );
    },
    [handleFeedItemPress, onDeleteItem]
  );

  const renderSkeletonItem = useCallback(
    () => (
      <SkeletonPlaceholder className="h-20 mb-3 rounded-lg bg-greyBackground mx-5" />
    ),
    []
  );

  return (
    <View className="flex-1 bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBackPress={() => navigation.goBack()}
        onClear={() => setSearchQuery("")}
      />
      {searchQuery.trim() === "" ? (
        <View className="flex-1 items-center justify-center px-6 mb-12">
          <View className="items-center">
            <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6 bg-primary/15">
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text className="text-2xl font-nunito-bold text-textPrimary mb-2 text-center">
              Search Your Study Sets
            </Text>
            <Text className="text-base text-textSecondary font-nunito text-center mb-6 leading-6 max-w-xs">
              Find quizzes and flashcards by typing keywords
            </Text>
          </View>
        </View>
      ) : filteredFeed.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6 bg-greyBackground">
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.textSecondary}
              />
            </View>
            <Text className="text-2xl font-nunito-bold text-textPrimary mb-2 text-center">
              No Results Found
            </Text>
            <Text className="text-base text-textSecondary font-nunito text-center mb-6 leading-6 max-w-xs">
              Try searching with different keywords
            </Text>
          </View>
        </View>
      ) : (
        <FlashList
          data={
            isLoading ? (Array.from({ length: 8 }) as FeedItem[]) : filteredFeed
          }
          keyExtractor={(it: FeedItem, idx: number) =>
            it?._id || `search-${idx}`
          }
          renderItem={isLoading ? renderSkeletonItem : renderItem}
          contentContainerClassName="pb-6"
          className="mt-10"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Search;
