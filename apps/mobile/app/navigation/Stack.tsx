import Quiz from "@/app/modules/quiz/screens/Quiz";
import AuthStack from "@/modules/auth/navigation/AuthStack";
import { useUserStore } from "@/modules/auth/store/userStore";
import FlashcardScreen from "@/modules/flashcards/screens/FlashcardScreen";
import Home from "@/modules/home/screens/Home";
import Search from "@/modules/home/screens/Search";
import Paywall from "@/modules/paywall/screens/Paywall";
import Settings from "@/modules/settings/screens/Settings";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import ForceUpdateModal from "../components/ForceUpdateModal";
import { useForceUpdate } from "../hooks/useForceUpdate";

const stack = createNativeStackNavigator();

const Stack = () => {
  const { isOnboardingCompleted, user, isAuthenticated } = useUserStore();
  const { shouldForceUpdate, versionInfo, openAppStore } = useForceUpdate();
  const isAuthorized = user?.token && isAuthenticated && isOnboardingCompleted;
  return (
    <>
      <stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerShown: false,
          animation: Platform.OS === "android" ? "fade" : "default",
        }}
        initialRouteName={
          isAuthorized ? (user?.isProUser ? "Main" : "Main") : "Auth"
        }
      >
        <stack.Screen name="Auth" component={AuthStack} />
        <stack.Screen name="Main" component={Home} />
        <stack.Screen name="Search" component={Search} />
        <stack.Screen name="Quiz" component={Quiz} />
        <stack.Screen name="FlashcardScreen" component={FlashcardScreen} />
        <stack.Screen name="Paywall" component={Paywall} />
        <stack.Screen name="Settings" component={Settings} />
      </stack.Navigator>
      <ForceUpdateModal
        visible={shouldForceUpdate}
        onUpdate={openAppStore}
        versionInfo={versionInfo}
      />
    </>
  );
};

export default Stack;
