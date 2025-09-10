import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import { client } from "@/app/services";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const History: React.FC = () => {
  const navigation = useNavigation();
  const getQuizHistory = async () => {
    const response = await client.get("quiz/history");
    return response.data;
  };
  const { data: history, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: getQuizHistory,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
  });

  const handleQuizPress = (quiz: any) => {
    (navigation as any).navigate("Quiz", { quizData: quiz, isHistory: true });
  };

  const renderSkeleton = () => {
    return <SkeletonPlaceholder className="h-20 w-full mb-3 rounded-lg" />;
  };

  const renderItem = ({ item }: { item: any }) => {
    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      <TouchableOpacity
        key={item?._id}
        className="bg-white p-4 rounded-lg mb-3 shadow-lg"
        onPress={() => handleQuizPress(item)}
        activeOpacity={0.8}
      >
        <Text
          numberOfLines={1}
          className="text-lg font-nunito-bold text-textPrimary mb-2"
        >
          {item.description?.trim()}
        </Text>
        <Text className="text-textSecondary text-sm font-nunito">{date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {isLoading || history?.quizzes?.length > 0 ? (
        <FlatList
          data={isLoading ? Array.from({ length: 10 }) : history?.quizzes}
          renderItem={isLoading ? renderSkeleton : renderItem}
          keyExtractor={(item) => item?._id}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-safe"
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-9xl mb-4">📚</Text>
          <Text className="text-textPrimary text-2xl font-nunito-bold mb-2">
            No Quiz History
          </Text>
          <Text className="text-textSecondary text-center font-nunito text-lg">
            Your completed quizzes will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

export default History;
