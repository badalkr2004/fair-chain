import { View, Text, Pressable } from "react-native";
import { Button } from "@/components/ui/button";
import { Link, router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      {/* Logo Icon */}
      <View className="bg-green-500 rounded-full p-4 mb-4">
        <Text className="text-white text-2xl">🍃</Text>
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold">
        <Text className="text-black">Harvest</Text>
        <Text className="text-green-500">Trace</Text>
      </Text>

      {/* Subtitle */}
      <Text className="text-center text-gray-600 text-base mt-2 mb-6">
        Farm to table traceability for farmers, distributors, and consumers.
      </Text>

      {/* Login Button */}
      <Link href="/(auth)/login" asChild>
        <Button className="w-full bg-green-500 mb-3" size="lg">
          <Text className="text-white font-semibold">Login</Text>
        </Button>
      </Link>

      {/* Create Account Button */}
      <Link href="/(auth)/signup" asChild>
        <Button
          className="w-full border border-green-500"
          size="lg"
          variant="outline"
        >
          <Text className="text-green-500 font-semibold">Create Account</Text>
        </Button>
      </Link>

      {/* Browse as Guest */}
      <Pressable onPress={() => router.push("/(tabs)")}>
        <Text className="text-gray-500 mt-4 mb-6">Browse as Guest</Text>
      </Pressable>

      {/* Feature Icons */}
      <View className="flex-row justify-around w-full px-4">
        <View className="items-center">
          <View className="bg-green-100 p-3 rounded-full mb-1">
            <Text>🍃</Text>
          </View>
          <Text className="text-xs text-gray-600">Farm Direct</Text>
        </View>

        <View className="items-center">
          <View className="bg-yellow-100 p-3 rounded-full mb-1">
            <Text>📦</Text>
          </View>
          <Text className="text-xs text-gray-600">Transparent</Text>
        </View>

        <View className="items-center">
          <View className="bg-gray-200 p-3 rounded-full mb-1">
            <Text>✔️</Text>
          </View>
          <Text className="text-xs text-gray-600">Verified</Text>
        </View>
      </View>
    </View>
  );
}
