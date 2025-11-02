import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { clsx } from "clsx";
import React from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import BottomSheetModal from "@/app/components/BottomSheetModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import colors from "@/app/constants/colors";
import { useUserStore } from "@/app/modules/auth/store/userStore";
import FABMenu from "@/app/modules/home/components/FABMenu";
import FlashcardCreateSheetContent from "@/app/modules/home/components/FlashcardCreateSheetContent";
import QuizCreateSheetContent from "@/app/modules/home/components/QuizCreateSheetContent";
import type { FeedItem } from "@/app/modules/home/hooks/useHome";
import { useHome } from "@/app/modules/home/hooks/useHome";
import { heightPercentageToDP } from "react-native-responsive-screen";

const Home: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const {
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
  } = useHome();

  const renderItem = ({ item }: { item: FeedItem }) => {
    return (
      <TouchableOpacity
        className="bg-white p-5 rounded-2xl mb-4"
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

  const skeletonItem = () => {
    return (
      <SkeletonPlaceholder className="h-20 w-full mb-3 rounded-lg bg-greyBackground" />
    );
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center justify-between px-5 pb-4">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-greyBackground items-center justify-center"
          onPress={() => (navigation as any).navigate("Settings")}
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
          onPress={() => (navigation as any).navigate("Search")}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading || feed.length > 0 ? (
        <FlatList
          data={(isLoading ? Array.from({ length: 8 }) : feed) as any}
          keyExtractor={(it: any, idx) => it?._id || `skeleton-${idx}`}
          renderItem={isLoading ? skeletonItem : renderItem}
          contentContainerClassName="px-5 pb-6"
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
              onPress={() => setIsFABMenuOpen(true)}
              className="!bg-primary min-w-[200]"
            />
          </View>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setIsFABMenuOpen(true)}
        activeOpacity={0.9}
        className="p-4 rounded-full bg-primary items-center justify-center absolute right-5 bottom-12 z-10"
        style={{
          opacity: isCreateOpen || isFABMenuOpen || feed?.length === 0 ? 0 : 1,
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
        onClose={() => setIsFABMenuOpen(false)}
        options={fabMenuOptions}
      />

      <BottomSheetModal
        sheetRef={createSheetRef}
        scrollView
        maxDynamicContentSize={heightPercentageToDP(88)}
        onChange={(index) => setIsCreateOpen(index !== -1)}
        onDismiss={() => setIsCreateOpen(false)}
      >
        <View className="px-5 pt-6 pb-4 flex-1 flex-grow">
          <View className="flex-row bg-greyBackground rounded-2xl p-1 mb-6">
            {(["quiz", "flashcards"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveCreateTab(tab)}
                className={clsx(
                  "flex-1 items-center justify-center py-3 rounded-xl",
                  activeCreateTab === tab ? "bg-white" : ""
                )}
                style={
                  activeCreateTab === tab
                    ? {
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.15,
                        shadowRadius: 3,
                        elevation: 2,
                      }
                    : undefined
                }
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
              onFileRemove={() => setAttachedFile(null)}
              onFileSelect={(file) => setAttachedFile(file)}
              onGenerateQuiz={(d, t, n, e) => {
                setIsCreateOpen(false);
                onGenerateQuiz(d, t, n, e);
                createSheetRef.current?.close();
              }}
            />
          ) : (
            <FlashcardCreateSheetContent
              topicText={topicText}
              onTextChange={setTopicText}
              attachedFile={attachedFile}
              onFileRemove={() => setAttachedFile(null)}
              onFileSelect={(file) => setAttachedFile(file)}
              isGenerating={
                generateFlashcardsMutation.isPending ||
                generateFlashcardsFromFileMutation.isPending
              }
              onGenerate={async (data) => {
                setIsCreateOpen(false);
                createSheetRef.current?.close();
                await handleGenerateFlashcards(data);
              }}
            />
          )}
        </View>
      </BottomSheetModal>

      <AnimatedLoadingModal
        isVisible={
          isGeneratingQuiz ||
          generateFlashcardsMutation.isPending ||
          generateFlashcardsFromFileMutation.isPending
        }
      />
    </View>
  );
};

export default Home;
