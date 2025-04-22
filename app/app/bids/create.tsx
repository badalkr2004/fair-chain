import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getProductById } from '../../services/products';
import { createBid, CreateBidDTO } from '../../services/bids';
import { authService } from '../../services';
import { UserRole } from '../../services/auth';

const SERVICE_TYPES = ['LOGISTICS', 'AGGREGATOR', 'STORAGE', 'PROCESSOR'];

export default function CreateBidScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [bidData, setBidData] = useState<Partial<CreateBidDTO>>({
    productId: productId as string,
    serviceType: SERVICE_TYPES[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        if (userData?.role !== UserRole.INTERMEDIARY) {
          Alert.alert('Not Authorized', 'Only intermediaries can place bids');
          router.back();
          return;
        }
        
        if (!productId) {
          Alert.alert('Error', 'Product ID is required');
          router.back();
          return;
        }
        
        const productData = await getProductById(productId as string);
        setProduct(productData);
        
        // Set default values
        setBidData(prev => ({
          ...prev,
          productId: productId as string,
          price: productData.basePrice,
          quantity: Math.min(productData.quantity, 10), // Default to min of 10 or available
        }));
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product details');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  const handleSubmit = async () => {
    // Validate required fields
    if (!bidData.price || !bidData.quantity || !bidData.serviceType || !bidData.description || !bidData.validUntil) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    if (bidData.quantity > product.quantity) {
      Alert.alert('Invalid Quantity', `Maximum available quantity is ${product.quantity} ${product.unit}s`);
      return;
    }
    
    if (bidData.price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await createBid(bidData as CreateBidDTO);
      
      Alert.alert(
        'Bid Placed Successfully', 
        'Your bid has been submitted to the farmer',
        [{ text: 'View My Bids', onPress: () => router.push('/bids') }, { text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting bid:', error);
      Alert.alert('Error', 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (_: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setBidData(prev => ({
        ...prev,
        validUntil: selectedDate.toISOString(),
      }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place a Bid</Text>
      </View>
      
      {product && (
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productMeta}>
            Base price: ${product.basePrice}/{product.unit} • Available: {product.quantity} {product.unit}s
          </Text>
        </View>
      )}
      
      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <Text style={styles.label}>Your Bid Price (per {product?.unit})</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={bidData.price?.toString()}
              onChangeText={(text) => setBidData(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
              placeholder="Enter your bid price"
            />
          </View>
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Quantity ({product?.unit}s)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={bidData.quantity?.toString()}
            onChangeText={(text) => setBidData(prev => ({ ...prev, quantity: parseInt(text) || 0 }))}
            placeholder={`Enter quantity (max: ${product?.quantity})`}
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Bid Valid Until</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#666" style={styles.dateIcon} />
            <Text style={styles.dateText}>
              {bidData.validUntil ? formatDate(bidData.validUntil) : 'Select expiration date'}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={bidData.validUntil ? new Date(bidData.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              mode="date"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Service Type</Text>
          <View style={styles.serviceTypesContainer}>
            {SERVICE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.serviceTypeButton,
                  bidData.serviceType === type && styles.selectedServiceType
                ]}
                onPress={() => setBidData(prev => ({ ...prev, serviceType: type }))}
              >
                <Text 
                  style={[
                    styles.serviceTypeText,
                    bidData.serviceType === type && styles.selectedServiceTypeText
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={bidData.description}
            onChangeText={(text) => setBidData(prev => ({ ...prev, description: text }))}
            placeholder="Describe your offer and services..."
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Additional Terms (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={bidData.terms}
            onChangeText={(text) => setBidData(prev => ({ ...prev, terms: text }))}
            placeholder="Add any additional terms or conditions..."
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Bid'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  serviceTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  serviceTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedServiceType: {
    backgroundColor: '#4285F4',
  },
  serviceTypeText: {
    fontSize: 14,
    color: '#555',
  },
  selectedServiceTypeText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 