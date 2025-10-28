import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserStore } from "../../auth/store/userStore";
import DeckList from "../components/DeckList";
import FlashcardGenerator from "../components/FlashcardGenerator";
// StudyAnalytics and StudyStreak intentionally removed to keep a single global streak on Home
import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import { useFlashcardAPI } from "../hooks/useFlashcardAPI";

interface Deck {
  _id: string;
  name: string;
  description: string;
  flashcards: any[];
  category: string;
  difficulty: string;
  studyCount: number;
  lastStudied?: string;
  color: string;
  createdAt: string;
}

interface StudyStatistics {
  totalCards: number;
  cardsDue: number;
  cardsLearning: number;
  cardsReviewing: number;
  cardsMastered: number;
  averageAccuracy: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
}

const FlashcardHome: React.FC = () => {
  const navigation = useNavigation();
  const { user, hasUsedFreeDeck, setHasUsedFreeDeck } = useUserStore();
  const [activeTab, setActiveTab] = useState<"study" | "create" | "decks">(
    "study"
  );
  const [decks, setDecks] = useState<Deck[]>([]);
  const [statistics, setStatistics] = useState<StudyStatistics>({
    totalCards: 0,
    cardsDue: 0,
    cardsLearning: 0,
    cardsReviewing: 0,
    cardsMastered: 0,
    averageAccuracy: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  });
  const {
    generateFlashcards,
    generateFlashcardsFromFile,
    useUserDecks,
    useStudyProgress,
    queryClient,
    generateFlashcardsMutation,
    generateFlashcardsFromFileMutation,
  } = useFlashcardAPI();

  // Use React Query hooks directly to avoid unstable deps/infinite loops
  const { data: decksData, isLoading: decksLoading } = useUserDecks();
  const { data: statsData, isLoading: statsLoading } = useStudyProgress();

  const isLoading = decksLoading || statsLoading;
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshStudy = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] }),
        queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const onRefreshDecks = useCallback(async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Update local state when query data changes
  useEffect(() => {
    if (decksData) {
      setDecks(decksData.decks || []);
    }
  }, [decksData]);

  useEffect(() => {
    if (statsData) {
      const defaults: StudyStatistics = {
        totalCards: 0,
        cardsDue: 0,
        cardsLearning: 0,
        cardsReviewing: 0,
        cardsMastered: 0,
        averageAccuracy: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      };
      setStatistics({
        ...defaults,
        ...(statsData.statistics as Partial<StudyStatistics>),
      });
    }
  }, [statsData]);

  const handleGenerateFlashcards = async (data: {
    text: string;
    category: string;
    count: number;
    difficulty: string;
    file?: any;
  }) => {
    // Non-pro users: allow only a single successful deck generation lifetime
    if (!user?.isProUser && hasUsedFreeDeck) {
      (navigation as any).navigate("Paywall");
      return;
    }
    try {
      let result;
      if (data.file) {
        // Prefer file-based generation when a file is provided
        // Pass category as a generic topic to backend
        result = await generateFlashcardsFromFile(
          data.file,
          data.category || "General"
        );
      } else {
        result = await generateFlashcards(data);
      }
      if (result) {
        // Invalidate and refetch via React Query
        queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
        queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
        setActiveTab("decks");
        if (!user?.isProUser && !hasUsedFreeDeck) {
          setHasUsedFreeDeck(true);
        }
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    }
  };

  const handleDeckPress = (deck: Deck) => {
    // Navigate to deck details
    (navigation as any).navigate("DeckDetails", { deck });
  };

  const handleStudyPress = (deck: Deck) => {
    // Navigate to study session
    (navigation as any).navigate("StudySession", { deck });
  };

  const handleStartStudy = () => {
    // Find deck with most cards due or start with first deck
    const deckWithCardsDue = decks.find((deck) => deck.flashcards.length > 0);
    if (deckWithCardsDue) {
      handleStudyPress(deckWithCardsDue);
    }
  };

  const handleQuickTestMode = () => {
    const deckWithCardsDue = decks.find((deck) => deck.flashcards.length > 0);
    if (deckWithCardsDue) {
      // Navigate to study session with test mode pre-selected
      (navigation as any).navigate("StudySession", {
        deck: deckWithCardsDue,
        initialMode: "test",
      });
    } else {
      Alert.alert("No Cards", "Create some flashcards first!");
    }
  };

  const handleQuickWriteMode = () => {
    const deckWithCardsDue = decks.find((deck) => deck.flashcards.length > 0);
    if (deckWithCardsDue) {
      // Navigate to study session with write mode pre-selected
      (navigation as any).navigate("StudySession", {
        deck: deckWithCardsDue,
        initialMode: "write",
      });
    } else {
      Alert.alert("No Cards", "Create some flashcards first!");
    }
  };

  const tabs = [
    { id: "study" as const, label: "Study", icon: "school-outline" },
    { id: "create" as const, label: "Create", icon: "add-circle-outline" },
    { id: "decks" as const, label: "Decks", icon: "library-outline" },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 bg-background pt-safe">
        <View className="flex-row bg-white mx-4 rounded-xl p-1 ios:mt-4 android:mt-8 mb-4">
          <SkeletonPlaceholder className="flex-1 h-12 rounded-lg mx-1" />
          <SkeletonPlaceholder className="flex-1 h-12 rounded-lg mx-1" />
          <SkeletonPlaceholder className="flex-1 h-12 rounded-lg mx-1" />
        </View>

        <View className="flex-1 px-4">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <SkeletonPlaceholder className="w-48 h-6 rounded mb-4" />
              <SkeletonPlaceholder className="w-full h-6 rounded my-4" />
              <View className="flex-row justify-between my-4">
                <SkeletonPlaceholder className="w-16 h-16 rounded-full" />
                <SkeletonPlaceholder className="w-16 h-16 rounded-full" />
                <SkeletonPlaceholder className="w-16 h-16 rounded-full" />
              </View>
              <SkeletonPlaceholder className="w-full h-4 rounded my-2" />
              <SkeletonPlaceholder className="w-3/4 h-4 rounded my-2" />
              <SkeletonPlaceholder className="w-2/4 h-4 rounded my-2" />
            </View>

            <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <SkeletonPlaceholder className="w-32 h-6 rounded mb-4" />
              <SkeletonPlaceholder className="w-full h-14 rounded-xl mb-3" />
              <View className="flex-row gap-x-4 mt-4">
                <SkeletonPlaceholder className="flex-1 h-12 rounded-xl" />
                <SkeletonPlaceholder className="flex-1 h-12 rounded-xl" />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row bg-white mx-4 rounded-xl ios:mt-4 android:mt-8 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
              activeTab === tab.id ? "bg-primary" : ""
            }`}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? "white" : colors.textSecondary}
            />
            <Text
              className={`ml-2 font-nunito-semibold ${
                activeTab === tab.id ? "text-white" : "text-textSecondary"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1 px-4">
        {activeTab === "study" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefreshStudy}
              />
            }
          >
            <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <Text className="text-textPrimary font-nunito-bold text-xl mb-6">
                Study Analytics
              </Text>

              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-textSecondary font-nunito-semibold text-base">
                    Mastery Progress
                  </Text>
                  <Text className="text-textPrimary font-nunito-bold text-base">
                    {Math.round(
                      (statistics.cardsMastered /
                        Math.max(statistics.totalCards, 1)) *
                        100
                    )}
                    %
                  </Text>
                </View>
                <View className="w-full bg-greyBackground rounded-full h-3">
                  <View
                    className="bg-primary rounded-full h-3"
                    style={{
                      width: `${Math.min(
                        (statistics.cardsMastered /
                          Math.max(statistics.totalCards, 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </View>
              </View>

              <View className="flex-row justify-between mb-6">
                <View className="items-center">
                  <View className="w-12 h-12 bg-success rounded-full items-center justify-center mb-2">
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                  <Text className="text-textPrimary font-nunito-bold text-2xl">
                    {statistics.cardsMastered}
                  </Text>
                  <Text className="text-textSecondary font-nunito-medium text-sm">
                    Mastered
                  </Text>
                </View>

                <View className="items-center">
                  <View className="w-12 h-12 bg-warning rounded-full items-center justify-center mb-2">
                    <Ionicons name="school" size={20} color="white" />
                  </View>
                  <Text className="text-textPrimary font-nunito-bold text-2xl">
                    {statistics.cardsLearning + statistics.cardsReviewing}
                  </Text>
                  <Text className="text-textSecondary font-nunito-medium text-sm">
                    Studying
                  </Text>
                </View>

                <View className="items-center">
                  <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mb-2">
                    <Ionicons name="add" size={20} color="white" />
                  </View>
                  <Text className="text-textPrimary font-nunito-bold text-2xl">
                    {statistics.cardsDue}
                  </Text>
                  <Text className="text-textSecondary font-nunito-medium text-sm">
                    New
                  </Text>
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="trophy" size={22} color={colors.warning} />
                    <Text className="text-textSecondary font-nunito-medium text-base ml-2">
                      Average Accuracy
                    </Text>
                  </View>
                  <Text className="text-textPrimary font-nunito-bold text-base">
                    {Math.round(statistics.averageAccuracy)}%
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={22} color={colors.primary} />
                    <Text className="text-textSecondary font-nunito-medium text-base ml-2">
                      Total Study Time
                    </Text>
                  </View>
                  <Text className="text-textPrimary font-nunito-bold text-base">
                    {Math.round(statistics.totalStudyTime)}m
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="library"
                      size={22}
                      color={colors.textSecondary}
                    />
                    <Text className="text-textSecondary font-nunito-medium text-base ml-2">
                      Total Cards
                    </Text>
                  </View>
                  <Text className="text-textPrimary font-nunito-bold text-base">
                    {statistics.totalCards}
                  </Text>
                </View>
              </View>

              <View className="bg-greyBackground rounded-xl p-4">
                <Text className="text-textSecondary font-nunito-medium text-center text-base">
                  💪 Keep studying! Practice makes perfect!
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <Text className="text-textPrimary font-nunito-bold text-xl mb-6">
                Quick Study
              </Text>

              <View className="gap-y-4">
                <PrimaryButton
                  title="🎓 Start Studying"
                  onPress={handleStartStudy}
                />

                {/* <View className="flex-row gap-x-4 ">
                  <PrimaryButton
                    onPress={handleQuickTestMode}
                    title=" Test Mode"
                    className="!bg-blue flex-1"
                  />

                  <PrimaryButton
                    title="Write Mode"
                    onPress={handleQuickWriteMode}
                    className="!bg-green-500 flex-1"
                  />
                </View> */}
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === "create" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <FlashcardGenerator
              onGenerate={handleGenerateFlashcards}
              isGenerating={false}
            />
          </ScrollView>
        )}

        {activeTab === "decks" && (
          <DeckList
            decks={decks}
            onDeckPress={handleDeckPress}
            onStudyPress={handleStudyPress}
            isLoading={decksLoading}
            refreshing={refreshing}
            onRefresh={onRefreshDecks}
          />
        )}
      </View>
      <AnimatedLoadingModal
        isVisible={
          generateFlashcardsMutation.isPending ||
          generateFlashcardsFromFileMutation.isPending
        }
      />
    </View>
  );
};

export default FlashcardHome;
