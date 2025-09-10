import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import Onboarding from "../screens/Onboarding";

export type AuthStackParamList = {
  Onboarding: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={"Onboarding"}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={Onboarding} />
    </Stack.Navigator>
  );
};

export default AuthStack;
