import { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import traceabilityService from '../../services/traceability';

const eventTypeOptions = [
  { value: 'HARVESTED', label: 'Harvested 🌱', description: 'Marking when the crop was harvested' },
  { value: 'PROCESSED', label: 'Processed ⚙️', description: 'Processing of raw materials' },
  { value: 'PACKAGED', label: 'Packaged 📦', description: 'Product packaging completed' },
  { value: 'SHIPPED', label: 'Shipped 🚚', description: 'Product has been dispatched' },
  { value: 'RECEIVED', label: 'Received 📥', description: 'Product received at next stage' },
  { value: 'QUALITY_CHECK', label: 'Quality Check ✓', description: 'Product quality verification' },
  { value: 'STORED', label: 'Stored 🏪', description: 'Product placed in storage' }
];

export default function AddTraceabilityEventScreen() {
  const { productId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  
  const [form, setForm] = useState({
    eventType: '',
    location: {
      name: '',
      latitude: 17.385,
      longitude: 78.4867
    },
    details: {},
    attachments: []
  });

  const [details, setDetails] = useState([
    { key: '', value: '' }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationInputChange = (field: string, value: string) => {
    setForm(prev => ({ 
      ...prev, 
      location: { ...prev.location, [field]: value } 
    }));
  };

  const selectEventType = (eventType: string) => {
    handleInputChange('eventType', eventType);
    setShowEventTypeDropdown(false);
  };

  const handleDetailKeyChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index].key = value;
    setDetails(newDetails);
    updateDetailsObject(newDetails);
  };

  const handleDetailValueChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index].value = value;
    setDetails(newDetails);
    updateDetailsObject(newDetails);
  };

  const addDetailField = () => {
    setDetails([...details, { key: '', value: '' }]);
  };

  const removeDetailField = (index: number) => {
    if (details.length === 1) {
      setDetails([{ key: '', value: '' }]);
    } else {
      const newDetails = details.filter((_, i) => i !== index);
      setDetails(newDetails);
      updateDetailsObject(newDetails);
    }
  };

  const updateDetailsObject = (detailsArray: Array<{ key: string, value: string }>) => {
    const detailsObj: Record<string, string> = {};
    detailsArray.forEach(detail => {
      if (detail.key && detail.value) {
        detailsObj[detail.key] = detail.value;
      }
    });
    setForm(prev => ({ ...prev, details: detailsObj }));
  };

  const validateForm = () => {
    if (!form.eventType) {
      Alert.alert('Missing Event Type', 'Please select an event type');
      return false;
    }
    
    if (!form.location.name) {
      Alert.alert('Missing Location', 'Please provide a location name');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await traceabilityService.recordSupplyChainEvent({
        productId: productId as string,
        eventType: form.eventType as any,
        location: form.location,
        details: form.details
      });
      
      Alert.alert(
        'Success', 
        'Supply chain event recorded successfully', 
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to record event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="px-6 pt-16 pb-10">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#16a34a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">Record Supply Chain Event</Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Event Type Dropdown */}
            <Text className="text-gray-700 mb-2 font-medium">Event Type*</Text>
            <TouchableOpacity 
              className="border border-gray-300 rounded-lg p-3 mb-1 flex-row justify-between items-center"
              onPress={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
            >
              <Text className={form.eventType ? "text-gray-800" : "text-gray-400"}>
                {form.eventType 
                  ? eventTypeOptions.find(opt => opt.value === form.eventType)?.label 
                  : "Select event type"}
              </Text>
              <Ionicons name={showEventTypeDropdown ? "chevron-up" : "chevron-down"} size={18} color="#9ca3af" />
            </TouchableOpacity>
            
            {showEventTypeDropdown && (
              <View className="border border-gray-200 rounded-lg mt-1 mb-4 bg-white">
                {eventTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="p-3 border-b border-gray-100"
                    onPress={() => selectEventType(option.value)}
                  >
                    <Text className={form.eventType === option.value ? "text-green-600 font-medium" : "text-gray-800"}>
                      {option.label}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!showEventTypeDropdown && <View className="mb-4" />}

            {/* Location */}
            <Text className="text-gray-700 mb-2 font-medium">Location Name*</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="E.g., Processing Facility, Farm, Warehouse"
              value={form.location.name}
              onChangeText={(value) => handleLocationInputChange('name', value)}
            />

            {/* Additional Details */}
            <Text className="text-gray-700 mb-2 font-medium">Additional Details</Text>
            
            {details.map((detail, index) => (
              <View key={index} className="flex-row mb-2">
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 flex-1 mr-2"
                  placeholder="Label"
                  value={detail.key}
                  onChangeText={(value) => handleDetailKeyChange(index, value)}
                />
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 flex-1 mr-2"
                  placeholder="Value"
                  value={detail.value}
                  onChangeText={(value) => handleDetailValueChange(index, value)}
                />
                <TouchableOpacity 
                  className="w-10 h-12 bg-red-50 rounded-lg items-center justify-center"
                  onPress={() => removeDetailField(index)}
                >
                  <Ionicons name="close-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              className="flex-row items-center mt-2 mb-6"
              onPress={addDetailField}
            >
              <Ionicons name="add-circle-outline" size={18} color="#16a34a" />
              <Text className="text-green-600 ml-1">Add More Details</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-green-500 py-3 rounded-lg items-center justify-center mt-4"
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Record Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 