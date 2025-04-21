import { Text, View, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useSharedValue, 
  useAnimatedStyle,
  withSpring 
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function Index() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const navigateToLogin = () => {
    router.push("./(auth)/login");
  };

  const navigateToFarmerOnboarding = () => {
    router.push("./farmer/onboarding");
  };

  const navigateToIntermediaryOnboarding = () => {
    router.push("./intermediary/onboarding");
  };

  const navigateToConsumerOnboarding = () => {
    router.push("./consumer/onboarding");
  };

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-16">
          <Animated.View entering={FadeInDown.delay(200).duration(700)} className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-4xl font-bold text-green-800 mb-2">
                FairChain
              </Text>
              <Text className="text-xl text-green-700">
                AI-Powered Transparent Agri-Marketplace
              </Text>
            </View>
            <TouchableOpacity
              onPress={navigateToLogin}
              className="bg-green-100 px-4 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name="log-in-outline" size={20} color="#16a34a" />
              <Text className="text-green-700 font-medium ml-1">Login</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            className="bg-white rounded-3xl overflow-hidden mb-10 shadow-sm"
            entering={FadeInUp.delay(400).duration(700)}
          >
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2670&auto=format&fit=crop" }} 
              style={{ width: width - 48, height: 200 }}
              className="rounded-t-3xl"
            />
            <View className="p-5">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Connecting Farmers, Intermediaries, and Consumers
              </Text>
              <Text className="text-gray-600 mb-4">
                Join our transparent marketplace that ensures fair profit distribution and trust among all stakeholders in the agricultural supply chain.
              </Text>
            </View>
          </Animated.View>

          <Animated.View 
            className="mb-8"
            entering={FadeInUp.delay(600).duration(700)}
          >
            <Text className="text-xl font-semibold text-green-800 mb-4">
              Select your role
            </Text>
            
            <Animated.View
              style={animatedStyle}
              onTouchStart={handlePressIn}
              onTouchEnd={handlePressOut}
            >
              <Button 
                className="bg-green-600 mb-3 h-16 rounded-xl"
                variant="solid"
                onPress={navigateToFarmerOnboarding}
              >
                <Text className="text-white text-lg font-medium">Farmer</Text>
              </Button>
            </Animated.View>

            <Animated.View
              style={animatedStyle}
              onTouchStart={handlePressIn}
              onTouchEnd={handlePressOut}
            >
              <Button 
                className="bg-amber-600 mb-3 h-16 rounded-xl"
                variant="solid"
                onPress={navigateToIntermediaryOnboarding}
              >
                <Text className="text-white text-lg font-medium">Intermediary</Text>
              </Button>
            </Animated.View>

            <Animated.View
              style={animatedStyle}
              onTouchStart={handlePressIn}
              onTouchEnd={handlePressOut}
            >
              <Button 
                className="bg-blue-600 h-16 rounded-xl"
                variant="solid"
                onPress={navigateToConsumerOnboarding}
              >
                <Text className="text-white text-lg font-medium">Consumer</Text>
              </Button>
            </Animated.View>
          </Animated.View>

          <Animated.View 
            className="mb-6"
            entering={FadeInUp.delay(800).duration(700)}
          >
            <Text className="text-xl font-semibold text-green-800 mb-4">
              Key Features
            </Text>
            
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <Text className="text-gray-800 font-medium mb-1">✓ Transparent Pricing</Text>
              <Text className="text-gray-600 text-sm">See exactly how profits are shared among stakeholders</Text>
            </View>
            
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <Text className="text-gray-800 font-medium mb-1">✓ AI-Powered Forecasting</Text>
              <Text className="text-gray-600 text-sm">Get insights on demand and supply trends</Text>
            </View>
            
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <Text className="text-gray-800 font-medium mb-1">✓ End-to-End Traceability</Text>
              <Text className="text-gray-600 text-sm">Track produce from farm to table</Text>
            </View>
            
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-800 font-medium mb-1">✓ Secure Transactions</Text>
              <Text className="text-gray-600 text-sm">Smart contract-style rules for payments</Text>
            </View>
          </Animated.View>

          <View className="mt-8 mx-4">
            <TouchableOpacity
              onPress={() => router.push('/traceability/scan')}
              className="flex-row items-center justify-center bg-green-100 p-4 rounded-xl"
            >
              <Ionicons name="qr-code" size={24} color="#16a34a" />
              <Text className="ml-2 text-green-800 font-semibold">Scan QR Code to Verify Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
