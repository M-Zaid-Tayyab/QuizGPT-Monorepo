import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import clsx from "clsx";
import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  backIconName?: keyof typeof Ionicons.glyphMap;
  backIconSize?: number;
  backIconColor?: string;
  titleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  backButtonClassName?: string;
  centerComponent?: React.ReactNode;
  transparent?: boolean;
  elevation?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  backIconName = "chevron-back",
  backIconSize = 24,
  backIconColor = "#333333",
  titleStyle,
  containerStyle,
  leftComponent,
  rightComponent,
  className = "",
  titleClassName = "",
  backButtonClassName = "",
  centerComponent,
  transparent = false,
  elevation = true,
}) => {
  const navigation = useNavigation();
  return (
    <View
      className={clsx(
        "flex-row items-center justify-between px-4 py-safe",
        {
          "bg-transparent": transparent,
          "bg-background": !transparent,
          "shadow-sm": elevation,
        },
        className
      )}
      style={containerStyle}
    >
      <View className="flex-row items-center flex-1">
        {showBackButton && (
          <TouchableOpacity
            onPress={onBackPress || (() => navigation.goBack())}
            className={`${backButtonClassName}`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={backIconName}
              size={backIconSize}
              color={backIconColor}
            />
          </TouchableOpacity>
        )}
        {leftComponent && <View className="ml-2">{leftComponent}</View>}
      </View>

      {centerComponent
        ? centerComponent
        : title && (
            <Text
              className={`text-2xl font-nunito-bold text-textPrimary ${titleClassName}`}
              style={titleStyle}
            >
              {title}
            </Text>
          )}

      <View className="flex-row items-center justify-end flex-1">
        {rightComponent && <View className="ml-2">{rightComponent}</View>}
      </View>
    </View>
  );
};

export default Header;
