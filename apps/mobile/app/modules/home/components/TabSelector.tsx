import clsx from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type Tab = "prompt" | "file";

type TabSelectorProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  className?: string;
};

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <View
      className={clsx(
        "flex-row bg-primary/10 rounded-lg p-1 border border-primary/10",
        className
      )}
    >
      <TouchableOpacity
        className={clsx(
          "flex-1 py-3 rounded-lg flex-row items-center justify-center",
          activeTab === "file" ? "bg-primary" : "bg-transparent"
        )}
        onPress={() => onTabChange("file")}
      >
        <Text
          className={clsx(
            "font-nunito-bold text-base",
            activeTab === "file" ? "text-white" : "text-primary"
          )}
        >
          File
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={clsx(
          "flex-1 py-3 rounded-lg flex-row items-center justify-center",
          activeTab === "prompt" ? "bg-primary" : "bg-transparent"
        )}
        onPress={() => onTabChange("prompt")}
      >
        <Text
          className={clsx(
            "font-nunito-bold text-base",
            activeTab === "prompt" ? "text-white" : "text-primary"
          )}
        >
          Prompt
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabSelector;
