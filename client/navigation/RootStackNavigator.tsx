import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import CommandListScreen from "@/screens/CommandListScreen";
import CommandEditScreen from "@/screens/CommandEditScreen";

export type RootStackParamList = {
  Home: undefined;
  CommandList: undefined;
  CommandEdit: { commandId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="CommandList"
        component={CommandListScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="CommandEdit"
        component={CommandEditScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}
