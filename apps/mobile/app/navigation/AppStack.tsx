import { NavigationContainer } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast } from "react-native-toast-message";
import { vexo } from "vexo-analytics";
import { useUserStore } from "../modules/auth/store/userStore";
import Stack from "./Stack";

Sentry.init({
  dsn: "https://b3beb1859d28aebb789df73dfd219b7c@o4510192039297024.ingest.us.sentry.io/4510192057843712",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY || "");

const queryClient = new QueryClient();
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "green",
        width: "92%",
      }}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "red",
        width: "92%",
      }}
    />
  ),
};
const AppStack = () => {
  const { setIsProUser } = useUserStore();
  const initiateRevenueCat = async () => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === "ios") {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_PROJECT_APPLE_API_KEY || "",
      });
    } else if (Platform.OS === "android") {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_PROJECT_GOOGLE_API_KEY || "",
      });
    }
    updateSubscriptionStatus(await Purchases.getCustomerInfo());
  };

  const updateSubscriptionStatus = (customerInfo: any) => {
    const isSubscribed = customerInfo.activeSubscriptions?.length > 0;
    setIsProUser(isSubscribed);
  };

  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log("Customer Info Updated: ", customerInfo);
      updateSubscriptionStatus(customerInfo);
    });
  }, []);

  useEffect(() => {
    initiateRevenueCat();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <Stack />
              <Toast
                config={toastConfig}
                topOffset={Platform.OS === "android" ? 30 : 90}
                visibilityTime={3000}
              />
              <StatusBar style="dark" translucent />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default Sentry.wrap(AppStack);
