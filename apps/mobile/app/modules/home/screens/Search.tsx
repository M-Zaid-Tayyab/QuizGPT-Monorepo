import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import colors from "@/app/constants/colors";
import type { FeedItem } from "@/app/modules/home/hooks/useHome";
import { useSearch } from "@/app/modules/home/hooks/useSearch";
import SearchHeader from "../components/SearchHeader";

const Search: React.FC = () => {
  const navigation = useNavigation();
  const {
    searchQuery,
    setSearchQuery,
    isLoading,
    filteredFeed,
    handleFeedItemPress,
    refreshFeed,
  } = useSearch();

  const renderItem = ({ item }: { item: FeedItem }) => {
    return (
      <TouchableOpacity
        className="bg-white p-5 rounded-2xl mb-3"
        activeOpacity={0.85}
        onPress={() => handleFeedItemPress(item)}
        style={{
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-start">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mr-3 bg-primary/15">
            <Ionicons
              name={item.type === "quiz" ? "document-text" : "library"}
              size={24}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={2}
              className="text-base font-nunito-bold text-textPrimary mb-1"
            >
              {item.title}
            </Text>
            <Text className="text-xs text-textSecondary font-nunito">
              {item.formattedDate}
            </Text>
          </View>
          <View className="px-3 py-1.5 rounded-full bg-primary/10">
            <Text className="text-xs font-nunito-semibold text-primary">
              {item.type === "quiz" ? "Quiz" : "Flashcard"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBackPress={() => (navigation as any).goBack()}
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
      ) : isLoading ? (
        <FlatList
          data={Array.from({ length: 8 })}
          keyExtractor={(_, idx) => `loading-${idx}`}
          renderItem={() => (
            <View className="h-20 w-full mb-3 rounded-lg bg-greyBackground" />
          )}
          contentContainerClassName="px-5 pb-6"
          className="mt-6"
          showsVerticalScrollIndicator={false}
        />
      ) : filteredFeed.length === 0 ? (
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
        <FlatList
          data={isLoading ? (Array.from({ length: 8 }) as any) : filteredFeed}
          keyExtractor={(it: any, idx) => it?._id || `search-${idx}`}
          renderItem={
            isLoading
              ? () => (
                  <View className="h-20 w-full mb-3 rounded-lg bg-greyBackground" />
                )
              : renderItem
          }
          contentContainerClassName="px-5 pb-6"
          className="mt-10"
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={refreshFeed}
        />
      )}
    </View>
  );
};

export default Search;
