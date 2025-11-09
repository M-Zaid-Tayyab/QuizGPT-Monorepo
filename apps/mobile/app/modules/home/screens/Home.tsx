import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { clsx } from "clsx";
import React, { useCallback } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import BottomSheetModal from "@/app/components/BottomSheetModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import colors from "@/app/constants/colors";
import { useUserStore } from "@/app/modules/auth/store/userStore";
import FABMenu from "@/app/modules/home/components/FABMenu";
import FlashcardCreateSheetContent from "@/app/modules/home/components/FlashcardCreateSheetContent";
import QuizCreateSheetContent from "@/app/modules/home/components/QuizCreateSheetContent";
import SwipeableFeedItem from "@/app/modules/home/components/SwipeableFeedItem";
import { FeedItem, useHome } from "@/app/modules/home/hooks/useHome";
import { FlashList } from "@shopify/flash-list";
import { heightPercentageToDP } from "react-native-responsive-screen";

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUserStore();
  const {
    topicText,
    setTopicText,
    attachedFile,
    setAttachedFile,
    activeCreateTab,
    isRefreshing,
    isLoading,
    feed,
    isFABMenuOpen,
    createSheetRef,
    refreshFeed,
    fabMenuOptions,
    handleFeedItemPress,
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
  } = useHome();

  const renderFeedItem = useCallback(
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
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center justify-between px-5 pb-4">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-greyBackground items-center justify-center"
          onPress={() => navigation.navigate("Settings")}
        >
          <Text className="text-textPrimary font-nunito-bold text-2xl text-center">
            {(user?.name?.[0] || "U").toUpperCase()}
          </Text>
        </TouchableOpacity>
        <Text className="text-2xl font-nunito-bold text-textPrimary tracking-tight">
          All Study Sets
        </Text>
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-greyBackground items-center justify-center"
          onPress={() => navigation.navigate("Search")}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading || feed.length > 0 ? (
        <FlashList
          data={isLoading ? (Array.from({ length: 8 }) as FeedItem[]) : feed}
          keyExtractor={(it: FeedItem, idx: number) =>
            it?._id || `skeleton-${idx}`
          }
          renderItem={isLoading ? renderSkeletonItem : renderFeedItem}
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
          className="mt-3"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshFeed}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6 mb-12">
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6 bg-primary/15">
              <Ionicons
                name="library-outline"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text className="text-2xl font-nunito-bold text-textPrimary mb-2 text-center">
              Create Your First Study Set
            </Text>
            <Text className="text-base text-textSecondary font-nunito text-center mb-6 leading-6 max-w-xs">
              Turn your study materials into study methods proven to work!
            </Text>
            <PrimaryButton
              title="Get Started"
              onPress={handleOpenFABMenu}
              className="!bg-primary min-w-[200]"
            />
          </View>
        </View>
      )}
      <TouchableOpacity
        onPress={handleOpenFABMenu}
        activeOpacity={0.9}
        className="p-4 rounded-full bg-primary items-center justify-center absolute right-5 bottom-12 z-10"
        style={{
          opacity: fabButtonOpacity,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={38} color={colors.white} />
      </TouchableOpacity>

      <FABMenu
        visible={isFABMenuOpen}
        onClose={handleCloseFABMenu}
        options={fabMenuOptions}
      />

      <BottomSheetModal
        sheetRef={createSheetRef}
        scrollView
        maxDynamicContentSize={heightPercentageToDP(88)}
        onChange={handleBottomSheetChange}
        onDismiss={handleBottomSheetDismiss}
      >
        <View className="px-5 pt-6 pb-4 flex-1 flex-grow">
          <View className="flex-row bg-greyBackground rounded-2xl p-1 mb-6">
            {createTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabChange(tab)}
                className={clsx(
                  "flex-1 items-center justify-center py-3 rounded-xl",
                  activeCreateTab === tab ? "bg-white" : ""
                )}
              >
                <Text
                  className={clsx(
                    "text-lg font-nunito-semibold",
                    activeCreateTab === tab
                      ? "text-primary"
                      : "text-textSecondary"
                  )}
                >
                  {tab === "quiz" ? "Quiz" : "Flashcards"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {activeCreateTab === "quiz" ? (
            <QuizCreateSheetContent
              topicText={topicText}
              onTextChange={setTopicText}
              attachedFile={attachedFile}
              onFileRemove={handleRemoveFile}
              onFileSelect={setAttachedFile}
              onGenerateQuiz={handleQuizGenerate}
            />
          ) : (
            <FlashcardCreateSheetContent
              topicText={topicText}
              onTextChange={setTopicText}
              attachedFile={attachedFile}
              onFileRemove={handleRemoveFile}
              onFileSelect={setAttachedFile}
              isGenerating={isFlashcardsGenerating}
              onGenerate={handleFlashcardsGenerate}
            />
          )}
        </View>
      </BottomSheetModal>
      <AnimatedLoadingModal isVisible={isAnyGenerating} />
    </View>
  );
};

export default Home;
