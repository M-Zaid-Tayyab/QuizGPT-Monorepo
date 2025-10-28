import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import Onboarding from "../screens/Onboarding";

const Stack = createStackNavigator();

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
