import colors from "@/app/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50"
      >
        <View
          className="absolute bg-white rounded-2xl overflow-hidden"
          style={{
            right: 20,
            bottom: 100,
            minWidth: 200,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                option.onPress();
                onClose();
              }}
              className="flex-row items-center px-5 py-2"
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
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FABMenu;
