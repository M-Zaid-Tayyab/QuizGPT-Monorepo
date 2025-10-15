import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface Deck {
  _id: string;
  name: string;
  description?: string;
  flashcards: Flashcard[];
  createdAt: string;
  studyCount: number;
  rating: number;
}

const DeckDetails: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { deck } = route.params as { deck: Deck };

  const handleStudy = () => {
    (navigation as any).navigate("StudySession", { deck });
  };

  const handleEdit = () => {
    Alert.alert("Edit Deck", "Edit functionality coming soon!");
  };

  const handleDelete = () => {
    Alert.alert("Delete Deck", "Are you sure you want to delete this deck?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // TODO: Implement delete functionality
          (navigation as any).goBack();
        },
      },
    ]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return colors.success;
      case "Medium":
        return colors.warning;
      case "Hard":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 pt-safe">
        <TouchableOpacity
          onPress={() => (navigation as any).goBack()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text className="text-textPrimary font-nunito-semibold ml-2">
            Back
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleEdit}
            className="p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Deck Info */}
        <View className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <Text className="text-textPrimary text-2xl font-nunito-bold mb-2">
            {deck.name}
          </Text>

          {deck.description && (
            <Text className="text-textSecondary font-nunito text-base mb-4">
              {deck.description}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="library" size={16} color={colors.primary} />
              <Text className="text-textPrimary font-nunito-semibold ml-2">
                {deck.flashcards.length} cards
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="school" size={16} color={colors.warning} />
              <Text className="text-textPrimary font-nunito-semibold ml-2">
                {deck.studyCount} studies
              </Text>
            </View>
          </View>
        </View>

        {/* Study Actions */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-textPrimary font-nunito-bold text-lg mb-4">
            Study Options
          </Text>

          <TouchableOpacity
            onPress={handleStudy}
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center mb-3"
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={20} color="white" />
            <Text className="text-white font-nunito-bold text-lg ml-2">
              Start Studying
            </Text>
          </TouchableOpacity>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle" size={16} color="white" />
              <Text className="text-white font-nunito-semibold text-sm ml-1">
                Test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-green-500 rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="create" size={16} color="white" />
              <Text className="text-white font-nunito-semibold text-sm ml-1">
                Write
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-purple-500 rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="git-merge" size={16} color="white" />
              <Text className="text-white font-nunito-semibold text-sm ml-1">
                Match
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Flashcards List */}
        <View className="bg-white rounded-2xl shadow-sm p-4">
          <Text className="text-textPrimary font-nunito-bold text-lg mb-4">
            Flashcards ({deck.flashcards.length})
          </Text>

          {deck.flashcards.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons
                name="library-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text className="text-textSecondary font-nunito text-center mt-2">
                No flashcards in this deck
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {deck.flashcards.map((card, index) => (
                <View
                  key={card._id}
                  className="bg-greyBackground rounded-xl p-4"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          getDifficultyColor(card.difficulty) + "20",
                      }}
                    >
                      <Text
                        className="text-xs font-nunito-semibold"
                        style={{ color: getDifficultyColor(card.difficulty) }}
                      >
                        {card.difficulty}
                      </Text>
                    </View>
                    <Text className="text-textSecondary font-nunito text-sm">
                      #{index + 1}
                    </Text>
                  </View>

                  <Text className="text-textPrimary font-nunito-bold text-base mb-1">
                    {card.front}
                  </Text>
                  <Text className="text-textSecondary font-nunito text-sm">
                    {card.back}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DeckDetails;

