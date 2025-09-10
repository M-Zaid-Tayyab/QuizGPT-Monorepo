import { useUserStore } from "@/app/modules/auth/store/userStore";
import { useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import Purchases from "react-native-purchases";

interface SubscriptionInfo {
  status: string;
  type: string;
  nextBillingDate: string;
  isActive: boolean;
  expirationDate?: string;
  productId?: string;
}

export const useSubscriptionManagement = () => {
  const { isProUser, setIsProUser } = useUserStore();
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptionInfo = async () => {
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.entitlements.active["pro_quizgpt"]) {
        const entitlement = customerInfo.entitlements.active["pro_quizgpt"];
        const activeSubscription = customerInfo.activeSubscriptions?.[0];

        let subscriptionType = "Premium";
        if (activeSubscription) {
          if (activeSubscription.includes("weekly")) {
            subscriptionType = "Weekly";
          } else if (
            activeSubscription.includes("annual") ||
            activeSubscription.includes("yearly")
          ) {
            subscriptionType = "Annual";
          }
        }

        let nextBillingDate = "Unknown";
        if (entitlement.expirationDate) {
          const expirationDate = new Date(entitlement.expirationDate);
          nextBillingDate = expirationDate.toLocaleDateString();
        }

        setSubscriptionInfo({
          status: "Active",
          type: subscriptionType,
          nextBillingDate,
          isActive: true,
          productId: activeSubscription || undefined,
        });
      } else {
        setSubscriptionInfo({
          status: "Inactive",
          type: "Free",
          nextBillingDate: "N/A",
          isActive: false,
        });
      }
    } catch (error) {
      console.error("Error loading subscription info:", error);
      setSubscriptionInfo({
        status: "Unknown",
        type: "Unknown",
        nextBillingDate: "N/A",
        isActive: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.managementURL) {
        const canOpen = await Linking.canOpenURL(customerInfo.managementURL);
        if (canOpen) {
          await Linking.openURL(customerInfo.managementURL);
        } else {
          showManageSubscriptionAlert();
        }
      } else {
        showManageSubscriptionAlert();
      }
    } catch (error) {
      console.error("Error managing subscription:", error);
      showManageSubscriptionAlert();
    }
  };

  const showManageSubscriptionAlert = () => {
    Alert.alert(
      "Manage Subscription",
      "You can manage your subscription through your device's subscription settings:\n\n• iOS: Settings > Apple ID > Subscriptions\n• Android: Google Play Store > Account > Subscriptions",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL(
                "App-Prefs:root=General&path=ManagedConfigurationList"
              );
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const refreshSubscriptionStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isSubscribed =
        customerInfo.entitlements.active["pro_quizgpt"] !== undefined;
      setIsProUser(isSubscribed);
      await loadSubscriptionInfo();
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
    }
  };

  useEffect(() => {
    loadSubscriptionInfo();
  }, [isProUser]);

  return {
    subscriptionInfo,
    isLoading,
    isProUser,
    loadSubscriptionInfo,
    manageSubscription,
    refreshSubscriptionStatus,
  };
};
