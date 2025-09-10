import Quiz from "@/app/modules/quiz/screens/Quiz";
import AuthStack from "@/modules/auth/navigation/AuthStack";
import { useUserStore } from "@/modules/auth/store/userStore";
import Paywall from "@/modules/paywall/screens/Paywall";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import BottomTabNavigator from "./BottomTabNavigator";

const stack = createNativeStackNavigator();

const Stack = () => {
  const { isOnboardingCompleted, user, isAuthenticated, isProUser } =
    useUserStore();
  const isAuthorized = user?.token && isAuthenticated && isOnboardingCompleted;
  return (
    <stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerShown: false,
        animation: Platform.OS === "android" ? "fade" : "default",
      }}
      initialRouteName={
        isAuthorized ? (isProUser ? "Main" : "Paywall") : "Auth"
      }
    >
      <stack.Screen name="Auth" component={AuthStack} />
      <stack.Screen name="Main" component={BottomTabNavigator} />
      <stack.Screen name="Quiz" component={Quiz} />
      <stack.Screen name="Paywall" component={Paywall} />
    </stack.Navigator>
  );
};

export default Stack;
