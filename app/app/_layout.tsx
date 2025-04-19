import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function Layout() {
  return (
    <GluestackUIProvider mode="light">
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" />
          <Stack.Screen name="farmer/index" />
          <Stack.Screen name="farmer/onboarding" />
          <Stack.Screen name="intermediary/index" />
          <Stack.Screen name="intermediary/onboarding" />
          <Stack.Screen name="consumer/index" />
          <Stack.Screen name="consumer/onboarding" />
          <Stack.Screen name="traceability/[id]" />
        </Stack>
      </View>
    </GluestackUIProvider>
  );
}
