import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface MatchItem {
  id: string;
  text: string;
  type: "term" | "definition";
  matched: boolean;
  position: { x: number; y: number };
}

interface MatchModeProps {
  flashcards: Flashcard[];
  onComplete: (results: {
    correct: number;
    total: number;
    percentage: number;
    timeSpent: number;
  }) => void;
  onExit: () => void;
}

const MatchMode: React.FC<MatchModeProps> = ({
  flashcards,
  onComplete,
  onExit,
}) => {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [matches, setMatches] = useState<
    { term: string; definition: string }[]
  >([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    generateMatchItems();
    setStartTime(Date.now());
  }, []);

  const generateMatchItems = () => {
    const matchItems: MatchItem[] = [];

    // Create terms and definitions
    flashcards.forEach((card, index) => {
      matchItems.push({
        id: `term-${index}`,
        text: card.front,
        type: "term",
        matched: false,
        position: { x: 50, y: 100 + index * 80 },
      });

      matchItems.push({
        id: `def-${index}`,
        text: card.back,
        type: "definition",
        matched: false,
        position: { x: width - 200, y: 100 + index * 80 },
      });
    });

    // Shuffle positions
    const shuffledItems = matchItems.map((item) => ({
      ...item,
      position: {
        x:
          item.type === "term"
            ? 50 + Math.random() * 100
            : width - 250 + Math.random() * 100,
        y: 100 + Math.random() * (height - 300),
      },
    }));

    setItems(shuffledItems);
  };

  const handleItemPress = (item: MatchItem) => {
    if (item.matched) return;

    if (!selectedItem) {
      setSelectedItem(item);
    } else {
      // Check if it's a valid match
      const isTerm = selectedItem.type === "term" && item.type === "definition";
      const isDefinition =
        selectedItem.type === "definition" && item.type === "term";

      if (isTerm || isDefinition) {
        // Check if they belong to the same flashcard
        const selectedIndex = selectedItem.id.split("-")[1];
        const currentIndex = item.id.split("-")[1];

        if (selectedIndex === currentIndex) {
          // Correct match!
          setItems((prev) =>
            prev.map((i) =>
              i.id === selectedItem.id || i.id === item.id
                ? { ...i, matched: true }
                : i
            )
          );

          setMatches((prev) => [
            ...prev,
            {
              term:
                selectedItem.type === "term" ? selectedItem.text : item.text,
              definition:
                selectedItem.type === "definition"
                  ? selectedItem.text
                  : item.text,
            },
          ]);
        }
      }

      setSelectedItem(null);
    }
  };

  useEffect(() => {
    const matchedCount = items.filter((item) => item.matched).length;
    if (matchedCount === items.length && items.length > 0) {
      completeMatch();
    }
  }, [items]);

  const completeMatch = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    const correct = matches.length;
    const total = flashcards.length;
    const percentage = Math.round((correct / total) * 100);

    setIsComplete(true);
    setShowResults(true);

    onComplete({
      correct,
      total,
      percentage,
      timeSpent,
    });
  };

  const getItemColor = (item: MatchItem) => {
    if (item.matched) return colors.success;
    if (selectedItem?.id === item.id) return colors.primary;
    return item.type === "term" ? colors.blue : colors.purple;
  };

  if (isComplete && showResults) {
    const correct = matches.length;
    const total = flashcards.length;
    const percentage = Math.round((correct / total) * 100);

    return (
      <View className="flex-1 bg-background px-4 py-8">
        <View className="flex-1 justify-center">
          <View className="bg-white rounded-2xl shadow-sm p-8 items-center">
            <Ionicons
              name={percentage >= 70 ? "trophy" : "school-outline"}
              size={64}
              color={percentage >= 70 ? colors.warning : colors.primary}
            />

            <Text className="text-textPrimary font-nunito-bold text-2xl mt-4 text-center">
              {percentage >= 70 ? "Great Job!" : "Keep Studying!"}
            </Text>

            <Text className="text-textSecondary font-nunito text-lg mt-2 text-center">
              You matched {correct} out of {total} pairs
            </Text>

            <View className="bg-primary/10 rounded-xl p-4 mt-6 w-full">
              <Text className="text-primary font-nunito-bold text-3xl text-center">
                {percentage}%
              </Text>
              <Text className="text-primary font-nunito text-sm text-center mt-1">
                Match Score
              </Text>
            </View>

            <View className="flex-row mt-6 space-x-4">
              <TouchableOpacity
                onPress={onExit}
                className="flex-1 bg-greyBackground rounded-xl py-3"
                activeOpacity={0.8}
              >
                <Text className="text-textPrimary font-nunito-semibold text-center">
                  Exit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  generateMatchItems();
                  setMatches([]);
                  setShowResults(false);
                  setIsComplete(false);
                  setStartTime(Date.now());
                }}
                className="flex-1 bg-primary rounded-xl py-3"
                activeOpacity={0.8}
              >
                <Text className="text-white font-nunito-semibold text-center">
                  Play Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity onPress={onExit} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            <Text className="text-textPrimary font-nunito-semibold ml-2">
              Exit Match
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Text className="text-textSecondary font-nunito text-sm">
              {matches.length} of {flashcards.length} matched
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl mx-4 p-3 mb-4">
          <Text className="text-blue-800 font-nunito-semibold text-sm mb-1">
            🎯 Match the terms with their definitions
          </Text>
          <Text className="text-blue-700 font-nunito text-sm">
            Tap a term, then tap its matching definition. Keep going until all
            pairs are matched!
          </Text>
        </View>

        {/* Match Items */}
        <View className="flex-1 relative">
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleItemPress(item)}
              className={clsx(
                "absolute p-4 rounded-xl border-2",
                item.matched ? "opacity-50" : "opacity-100"
              )}
              style={{
                left: item.position.x,
                top: item.position.y,
                backgroundColor: getItemColor(item) + "20",
                borderColor: getItemColor(item),
                maxWidth: 200,
              }}
              activeOpacity={0.8}
            >
              <Text
                className={clsx(
                  "font-nunito text-sm text-center",
                  item.matched ? "line-through" : ""
                )}
                style={{ color: getItemColor(item) }}
              >
                {item.text}
              </Text>

              {item.matched && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={{ position: "absolute", top: -5, right: -5 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress */}
        <View className="px-4 pb-4">
          <View className="bg-greyBackground rounded-full h-2">
            <View
              className="bg-primary rounded-full h-2"
              style={{
                width: `${(matches.length / flashcards.length) * 100}%`,
              }}
            />
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default MatchMode;

