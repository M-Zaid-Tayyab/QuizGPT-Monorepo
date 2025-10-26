import Quiz from "@/app/modules/quiz/screens/Quiz";
import AuthStack from "@/modules/auth/navigation/AuthStack";
import { useUserStore } from "@/modules/auth/store/userStore";
import DeckDetails from "@/modules/flashcards/screens/DeckDetails";
import StudySession from "@/modules/flashcards/screens/StudySession";
import Paywall from "@/modules/paywall/screens/Paywall";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import ForceUpdateModal from "../components/ForceUpdateModal";
import { useForceUpdate } from "../hooks/useForceUpdate";
import BottomTabNavigator from "./BottomTabNavigator";

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
          isAuthorized ? (user?.isProUser ? "Main" : "Paywall") : "Auth"
        }
      >
        <stack.Screen name="Auth" component={AuthStack} />
        <stack.Screen name="Main" component={BottomTabNavigator} />
        <stack.Screen name="Quiz" component={Quiz} />
        <stack.Screen name="StudySession" component={StudySession} />
        <stack.Screen name="DeckDetails" component={DeckDetails} />
        <stack.Screen name="Paywall" component={Paywall} />
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
