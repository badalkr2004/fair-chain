import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface VerificationButtonProps {
  productId?: string;
  style?: object;
  textStyle?: object;
  iconColor?: string;
  mode?: 'full' | 'compact';
}

/**
 * A reusable verification button that can be added to product screens
 * to allow users to scan QR codes and verify product authenticity
 */
export default function VerificationButton({ 
  productId, 
  style, 
  textStyle,
  iconColor = '#16a34a',
  mode = 'full'
}: VerificationButtonProps) {
  
  const handlePress = () => {
    // Navigate to scan screen with product ID as a param if available
    if (productId) {
      router.push({
        pathname: '/traceability/scan',
        params: { expectedId: productId }
      });
    } else {
      router.push('/traceability/scan');
    }
  };
  
  if (mode === 'compact') {
    return (
      <TouchableOpacity 
        style={[styles.compactButton, style]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name="qr-code" size={18} color={iconColor} />
        <Text style={[styles.compactButtonText, textStyle]}>Verify</Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Ionicons name="shield-checkmark" size={22} color={iconColor} />
        <Text style={[styles.buttonText, textStyle]}>
          Verify Authenticity
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#16a34a20',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginLeft: 8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf420',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
    marginLeft: 4,
  }
}); 