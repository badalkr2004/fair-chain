import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import authService, { UserRole } from '../../services/auth';

interface RoleOption {
  id: UserRole;
  title: string;
  icon: string;
  iconName: any; // Using any for Ionicons name to avoid type issues
  color: string;
  borderColor: string;
  textColor: string;
  description: string;
  features: string[];
}

const roles: RoleOption[] = [
  {
    id: UserRole.FARMER,
    title: 'Farmer',
    icon: '🌱',
    iconName: 'leaf-outline',
    color: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-800',
    description: 'I grow crops and want to sell directly to businesses and consumers',
    features: ['Manage produce listings', 'Track supply chain', 'Receive bids from buyers']
  },
  {
    id: UserRole.INTERMEDIARY,
    title: 'Intermediary',
    icon: '🚚',
    iconName: 'business-outline',
    color: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-800',
    description: 'I process, distribute, or sell agricultural products',
    features: ['Purchase directly from farmers', 'Track inventory', 'Manage distribution']
  },
  {
    id: UserRole.CONSUMER,
    title: 'Consumer',
    icon: '🛒',
    iconName: 'cart-outline',
    color: 'bg-blue-100',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-800',
    description: 'I purchase agricultural products for consumption or resale',
    features: ['Browse available produce', 'Track product origins', 'Place orders directly']
  }
];

export default function SignupScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (selectedRole) {
      setIsLoading(true);

      // Navigate to the appropriate onboarding screen
      if (selectedRole === UserRole.FARMER) {
        router.push('/farmer/onboarding');
      } else if (selectedRole === UserRole.INTERMEDIARY) {
        router.push('/intermediary/onboarding');
      } else if (selectedRole === UserRole.CONSUMER) {
        router.push('/consumer/onboarding');
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10"
        testID="back-button"
      >
        <Text className="text-green-500 font-semibold">Back</Text>
      </TouchableOpacity>

      <ScrollView className="flex-1 p-6 pt-24">
        {/* Header */}
        <Animated.View 
          className="mb-8"
          entering={FadeInDown.delay(100).duration(500)}
        >
          <Text className="text-3xl font-bold mb-2">Join HarvestTrace</Text>
          <Text className="text-gray-500">Select your role in the supply chain</Text>
        </Animated.View>

        {/* Role Selection */}
        <View className="mb-8">
          {roles.map((role, index) => (
            <Animated.View
              key={role.id}
              entering={FadeInDown.delay(200 + (index * 100)).duration(500)}
            >
              <TouchableOpacity
                className={`flex-row items-center p-4 mb-4 rounded-lg border ${
                  selectedRole === role.id ? role.borderColor : 'border-gray-200'
                } ${role.color}`}
                onPress={() => setSelectedRole(role.id)}
                testID={`role-${role.id}`}
              >
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
                  <Ionicons name={role.iconName} size={24} color={selectedRole === role.id ? "#16a34a" : "#666"} />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold text-lg ${role.textColor}`}>{role.title}</Text>
                  <Text className="text-gray-600 mb-2">{role.description}</Text>
                  
                  {selectedRole === role.id && (
                    <View className="bg-white/50 p-2 rounded-md">
                      {role.features.map((feature, i) => (
                        <View key={i} className="flex-row items-center mb-1">
                          <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                          <Text className="text-gray-700 text-sm ml-1">{feature}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                {selectedRole === role.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Continue Button */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
        >
          <TouchableOpacity
            className={`py-3 rounded-lg items-center justify-center mb-4 ${
              selectedRole ? 'bg-green-500' : 'bg-gray-300'
            }`}
            onPress={handleContinue}
            disabled={!selectedRole || isLoading}
            testID="continue-button"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Continue</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mb-4">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-green-500 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
} 