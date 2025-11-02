import Input from "@/app/components/Input";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import colors from "@/app/constants/colors";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onBackPress: () => void;
  onClear?: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onBackPress,
  onClear,
}) => {
  return (
    <View className="flex-row items-center pt-safe px-5">
      <TouchableOpacity
        onPress={onBackPress}
        className="mr-3"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View className="flex-1 flex-row items-center">
        <Input
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search your study sets..."
          placeholderTextColor={colors.textSecondary}
          className="flex-1"
          autoFocus
          rightButton={
            searchQuery.length > 0
              ? () => (
                  <TouchableOpacity
                    onPress={onClear || (() => onSearchChange(""))}
                    className="p-1"
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )
              : undefined
          }
        />
      </View>
    </View>
  );
};

export default SearchHeader;
