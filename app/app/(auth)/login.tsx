import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth';
import api from '../../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const isLoggedIn = await authService.isLoggedIn();
        if (isLoggedIn) {
          const user = await authService.getCurrentUser();
          if (user) {
            // Validate the token
            const isValid = await authService.validateToken();
            if (isValid) {
              // Redirect to appropriate screen based on role
              redirectBasedOnRole(user.role);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const redirectBasedOnRole = (role: string) => {
    if (role === 'FARMER') {
      router.replace('/farmer');
    } else if (role === 'INTERMEDIARY') {
      router.replace('/intermediary');
    } else if (role === 'CONSUMER') {
      router.replace('/consumer');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    // Reset error state
    setError(null);

    // Validate inputs
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log(`Login successful for ${email}`);
      
      // Route to appropriate screen based on user role
      redirectBasedOnRole(response.user.role);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Checking login status...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center p-6 bg-white">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-4 z-10"
          >
            <Text className="text-green-500 font-semibold">Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold mb-2">Welcome back</Text>
            <Text className="text-gray-500">Sign in to your account</Text>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {/* API Connection Status */}
          <TouchableOpacity 
            className="absolute top-12 right-4 z-10 flex-row items-center" 
            onPress={() => Alert.alert('API URL', `Connected to: ${api.getApiUrl()}`)}
          >
            <Ionicons name="server-outline" size={16} color="#16a34a" />
            <Text className="text-green-500 text-xs ml-1">API</Text>
          </TouchableOpacity>

          {/* Form */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              testID="email-input"
            />

            <Text className="text-gray-700 mb-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              testID="password-input"
            />

            <TouchableOpacity className="self-end mt-2">
              <Text className="text-green-500 font-semibold">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-green-500 py-3 rounded-lg items-center justify-center mb-4"
            onPress={handleLogin}
            disabled={isLoading}
            testID="login-button"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-green-500 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Test Credentials */}
          <View className="mt-8 border-t border-gray-100 pt-4">
            <Text className="text-gray-400 text-xs text-center mb-2">Demo Accounts</Text>
            <View className="flex-row justify-around">
              <TouchableOpacity 
                className="items-center" 
                onPress={() => {
                  setEmail('farmer2@example.com');
                  setPassword('password123');
                }}
              >
                <Text className="text-xs text-green-500">Farmer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="items-center" 
                onPress={() => {
                  setEmail('intermediary@example.com');
                  setPassword('password123');
                }}
              >
                <Text className="text-xs text-yellow-500">Intermediary</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="items-center" 
                onPress={() => {
                  setEmail('consumer@example.com');
                  setPassword('password123');
                }}
              >
                <Text className="text-xs text-blue-500">Consumer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  }
}); 