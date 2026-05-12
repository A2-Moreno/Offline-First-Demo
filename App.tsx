import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import React from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

import HomeScreen from "./src/features/home/HomeScreen";
import { lightTheme } from "./src/theme/theme";

export default function App() {
  const scheme = useColorScheme();

  //if (__DEV__) console.log("Current theme:", scheme);

  const navigationTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: lightTheme.colors.background,
      card: lightTheme.colors.surface,
      text: lightTheme.colors.onSurface,
      border: lightTheme.colors.outline,
      primary: lightTheme.colors.primary,
      notification: lightTheme.colors.error,
    },
  };

  return (
    <PaperProvider theme={lightTheme}>
      <NavigationContainer theme={navigationTheme}>
        <HomeScreen />
      </NavigationContainer>
    </PaperProvider>
  );
}
