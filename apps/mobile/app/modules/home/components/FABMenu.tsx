import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInRight,
  FadeOut,
} from "react-native-reanimated";

interface FABMenuOption {
  id: string;
  label: string;
  icon: string;
  iconType?: "ionicons" | "material";
  onPress: () => void;
}

interface FABMenuProps {
  visible: boolean;
  onClose: () => void;
  options: FABMenuOption[];
}

const FABMenu: React.FC<FABMenuProps> = ({ visible, onClose, options }) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="absolute inset-0"
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onClose}
        className="absolute inset-0 bg-black/50"
        style={{ zIndex: 999 }}
      >
        <View
          style={{
            position: "absolute",
            right: 20,
            bottom: 100,
            minWidth: 200,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
          className="bg-white rounded-2xl overflow-hidden"
        >
          {options.map((option, index) => (
            <Animated.View
              key={option.id}
              entering={FadeInRight.duration(300)
                .delay(index * 50)
                .springify()
                .damping(15)
                .stiffness(200)}
            >
              <TouchableOpacity
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                className="flex-row items-center px-5 py-3"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  {option.iconType === "material" ? (
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
                <Text className="text-textPrimary font-nunito-semibold text-base flex-1">
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default FABMenu;
