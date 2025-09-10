import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import { useSubscriptionManagement } from "../hooks/useSubscriptionManagement";

interface SubscriptionStatusProps {
  showManageButton?: boolean;
  onManagePress?: () => void;
  compact?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  showManageButton = false,
  onManagePress,
  compact = false,
}) => {
  const { isLoading, manageSubscription, subscriptionInfo } =
    useSubscriptionManagement();

  if (isLoading) {
    return (
      <View className={`bg-white rounded-2xl p-3 border border-gray-100`}>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mr-3" />
          <Text className="text-gray-400 font-nunito">
            Loading subscription info...
          </Text>
        </View>
      </View>
    );
  }

  if (Object.keys(subscriptionInfo).length === 0) {
    return null;
  }

  return (
    <View className="bg-white rounded-2xl border border-gray-100 py-5 px-4">
      <View className="flex-row items-center justify-between w-full bg-white">
        <View className="flex-row items-center bg-white flex-1 h-full">
          <View className="w-10 h-10 bg-success/10 rounded-full p-2">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={
                subscriptionInfo.isActive
                  ? colors.success
                  : colors.textSecondary
              }
            />
          </View>
          <View className="ml-4">
            <Text className="text-gray-900 font-nunito-bold text-base">
              {subscriptionInfo.status} Subscription
            </Text>
            <Text className="text-gray-500 text-sm font-nunito mt-2">
              {subscriptionInfo.type} Plan
            </Text>
            {subscriptionInfo.isActive && (
              <Text className="text-gray-500 text-sm font-nunito mt-2">
                Next billing: {subscriptionInfo.nextBillingDate}
              </Text>
            )}
          </View>
        </View>
        {showManageButton && subscriptionInfo.isActive && (
          <TouchableOpacity
            onPress={onManagePress || manageSubscription}
            className="bg-primary px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-nunito-bold text-sm">Manage</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SubscriptionStatus;
