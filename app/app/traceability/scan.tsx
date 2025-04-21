import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import traceabilityService from '../../services/traceability';
import Animated, { FadeIn } from 'react-native-reanimated';

function Scan() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    try {
      if (scanned || loading) return;
      
      setScanned(true);
      setLoading(true);
      
      console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
      
      // Check if the scanned code is a valid product identifier
      if (!data || data.length < 5) {
        Alert.alert('Invalid QR Code', 'This does not appear to be a valid FairChain product code.');
        setScanned(false);
        setLoading(false);
        return;
      }
      
      // Attempt to verify the product using the traceability service
      const response = await traceabilityService.verifyProduct(data);
      
      if (response && response.success) {
        // If verification is successful, show success message and navigate to the product details
        Alert.alert(
          'Product Verified ✓', 
          'This product is authentic and has been verified on the blockchain.',
          [
            { 
              text: 'View Details', 
              onPress: () => router.push({
                pathname: '/traceability/[id]',
                params: { id: response.data?.productId || data }
              })
            }
          ]
        );
      } else {
        // If verification fails, show warning message
        Alert.alert(
          'Verification Failed', 
          response.message || 'Could not verify this product. It may be counterfeit or data may be corrupt.',
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { text: 'Report Issue', onPress: () => {
              // This would typically open a form to report counterfeit products
              Alert.alert('Thank You', 'Your report helps us maintain the integrity of our supply chain.');
              setScanned(false);
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Error during verification:', error);
      Alert.alert(
        'Error',
        'An error occurred while verifying the product. Please try again.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Camera access denied</Text>
        <Text style={styles.instructionText}>
          We need camera access to scan QR codes. Please enable camera access in your device settings.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <BarCodeScanner
        style={styles.scanner}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Scan Product QR Code</Text>
        </View>
        
        <View style={styles.scannerMask}>
          <View style={styles.scannerTarget}>
            {loading && (
              <Animated.View entering={FadeIn} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Verifying product...</Text>
              </Animated.View>
            )}
          </View>
        </View>
        
        <Animated.View entering={FadeIn} style={styles.instructions}>
          <Text style={styles.instructionTitle}>Verify Product Authenticity</Text>
          <Text style={styles.instructionText}>
            Position the QR code within the frame to verify this product's origin and trace its journey through the supply chain.
          </Text>
        </Animated.View>
        
        {scanned && !loading && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerMask: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  instructionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  scanAgainButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanAgainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 8,
  },
});

export default Scan;