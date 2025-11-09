import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue } from "react-native-reanimated";

import colors from "@/app/constants/colors";
import type { FeedItem } from "@/app/modules/home/hooks/useHome";
import { widthPercentageToDP } from "react-native-responsive-screen";

interface SwipeableFeedItemProps {
  item: FeedItem;
  onPress: (item: FeedItem) => void;
  onDelete: (item: FeedItem) => void;
}

const RightAction = (
  prog: SharedValue<number>,
  drag: SharedValue<number>,
  item: FeedItem,
  onDelete: (item: FeedItem) => void
) => {
  const handleDelete = useCallback(() => {
    onDelete(item);
  }, [item, onDelete]);
  return (
    <Reanimated.View
      className="justify-center mb-5"
      style={{
        marginLeft: -widthPercentageToDP(8),
        paddingRight: 16,
      }}
    >
      <TouchableOpacity
        onPress={handleDelete}
        className="bg-red h-full justify-center items-center px-8 rounded-2xl"
        activeOpacity={0.7}
        style={{
          minWidth: 100,
        }}
      >
        <Ionicons name="trash" size={24} color={colors.white} />
        <Text className="text-white font-nunito-semibold text-xs mt-1">
          Delete
        </Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const SwipeableFeedItem: React.FC<SwipeableFeedItemProps> = ({
  item,
  onPress,
  onDelete,
}) => {
  const renderRightActions = useCallback(
    (prog: SharedValue<number>, drag: SharedValue<number>) =>
      RightAction(prog, drag, item, onDelete),
    [item, onDelete]
  );

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      containerStyle={{
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        className="bg-white p-5 rounded-2xl mb-4"
        onPress={handlePress}
        activeOpacity={1}
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
    </ReanimatedSwipeable>
  );
};

export default SwipeableFeedItem;
