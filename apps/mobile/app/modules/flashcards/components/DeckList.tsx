import PrimaryButton from "@/app/components/PrimaryButton";
import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

interface DeckListProps {
  decks: Deck[];
  onDeckPress: (deck: Deck) => void;
  onStudyPress: (deck: Deck) => void;
  onEditPress?: (deck: Deck) => void;
  onDeletePress?: (deck: Deck) => void;
  className?: string;
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const DeckList: React.FC<DeckListProps> = ({
  decks,
  onDeckPress,
  onStudyPress,
  onEditPress,
  onDeletePress,
  className,
  isLoading,
  refreshing = false,
  onRefresh,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
      case "Easy":
        return colors.success;
      case "Intermediate":
      case "Medium":
        return colors.warning;
      case "Advanced":
      case "Hard":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getCardsDueCount = (deck: Deck) => {
    // This would be calculated based on spaced repetition algorithm
    // For now, return a placeholder
    return Math.floor(Math.random() * deck.flashcards.length);
  };

  if (isLoading) {
    return (
      <View className={"flex-1 items-center"}>
        <SkeletonPlaceholder className="w-full h-32 rounded-lg mb-3" />
        <SkeletonPlaceholder className="w-full h-32 rounded-lg my-3" />
        <SkeletonPlaceholder className="w-full h-32 rounded-lg my-3" />
      </View>
    );
  }

  if (decks.length === 0) {
    return (
      <View
        className={clsx("flex-1 justify-center items-center py-12", className)}
      >
        <MaterialCommunityIcons
          name="cards-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text className="text-textSecondary font-nunito-bold text-lg mt-4">
          No Decks Yet
        </Text>
        <Text className="text-textSecondary font-nunito text-center mt-2 px-8">
          Create your first flashcard deck to start studying
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className={clsx("flex-1", className)}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      <View className="space-y-4">
        {decks.map((deck) => {
          const cardsDue = getCardsDueCount(deck);
          const hasCardsDue = cardsDue > 0;

          return (
            <View key={deck._id} className="bg-white rounded-2xl shadow-sm p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-5 h-5 rounded-full mr-3"
                      style={{ backgroundColor: deck.color }}
                    />
                    <Text className="text-textPrimary font-nunito-bold text-xl flex-1">
                      {deck.name}
                    </Text>
                  </View>

                  {deck.description && (
                    <Text className="text-textSecondary font-nunito text-sm mb-3">
                      {deck.description}
                    </Text>
                  )}
                </View>

                <View className="items-end">
                  <Text className="text-textPrimary font-nunito-bold text-2xl">
                    {deck.flashcards.length}
                  </Text>
                  <Text className="text-textSecondary font-nunito text-sm">
                    cards
                  </Text>
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View
                    className="px-3 py-1 rounded-full mr-3"
                    style={{
                      backgroundColor:
                        getDifficultyColor(deck.difficulty) + "20",
                    }}
                  >
                    <Text
                      className="text-sm font-nunito-semibold"
                      style={{ color: getDifficultyColor(deck.difficulty) }}
                    >
                      {deck.difficulty}
                    </Text>
                  </View>
                  <Text className="text-textSecondary font-nunito text-sm">
                    📚 {deck.category}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text className="text-textSecondary font-nunito text-sm ml-1">
                    {deck.lastStudied ? formatDate(deck.lastStudied) : "Never"}
                  </Text>
                </View>
              </View>

              {/* Cards Due Banner */}
              {hasCardsDue && (
                <View className="bg-primary/10 rounded-xl p-3 mb-4">
                  <Text className="text-primary font-nunito-semibold text-center">
                    🔔 {cardsDue} cards due for review
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <PrimaryButton
                  title="🎓 Study"
                  onPress={() => onStudyPress(deck)}
                  className="flex-1"
                />

                {onEditPress && (
                  <TouchableOpacity
                    onPress={() => onEditPress(deck)}
                    className="bg-greyBackground rounded-xl py-3 px-4"
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>
                )}

                {onDeletePress && (
                  <TouchableOpacity
                    onPress={() => onDeletePress(deck)}
                    className="bg-greyBackground rounded-xl py-3 px-4"
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default DeckList;
