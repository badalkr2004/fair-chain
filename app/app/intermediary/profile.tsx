'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/auth';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  type?: string;
  serviceAreas?: string[];
  services?: string[];
  licenseNumber?: string;
}

export default function IntermediaryProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: '',
    serviceAreas: [],
    services: [],
    licenseNumber: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      const profileData = await authService.getUserProfile();
      
      const combinedData = {
        ...userData,
        ...profileData,
      };
      
      setProfile(combinedData);
      setFormData({
        name: combinedData.name || '',
        email: combinedData.email || '',
        phone: combinedData.phone || '',
        address: combinedData.address || '',
        type: combinedData.type || '',
        serviceAreas: combinedData.serviceAreas || [],
        services: combinedData.services || [],
        licenseNumber: combinedData.licenseNumber || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await authService.updateUserProfile(formData);
      
      setProfile({
        ...profile,
        ...formData
      });
      
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await authService.logout();
              router.replace('/');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'An error occurred during logout');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
<ScrollView>
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Business Profile</Text>
        
        {!editing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={24} color="#f59e0b" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditing(false);
              // Reset form data to original profile
              if (profile) {
                setFormData({
                  name: profile.name || '',
                  email: profile.email || '',
                  phone: profile.phone || '',
                  address: profile.address || '',
                  type: profile.type || '',
                  serviceAreas: profile.serviceAreas || [],
                  services: profile.services || [],
                  licenseNumber: profile.licenseNumber || ''
                });
              }
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'I'}
              </Text>
            </View>
            
            {!editing && (
              <>
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.businessType}>{profile?.type}</Text>
              </>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            {editing ? (
              <>
                <View style={styles.formField}>
                  <Text style={styles.label}>Business Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Enter your business name"
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: '#f3f4f6' }]}
                    value={formData.email}
                    editable={false}
                    placeholder="Email address"
                  />
                  <Text style={styles.helperText}>Email cannot be changed</Text>
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.label}>Business Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.label}>License Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.licenseNumber}
                    onChangeText={(value) => handleInputChange('licenseNumber', value)}
                    placeholder="Enter license number"
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{profile?.email}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{profile?.phone || 'Not provided'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{profile?.address || 'Not provided'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>License: {profile?.licenseNumber || 'Not provided'}</Text>
                </View>
                
                {profile?.serviceAreas && profile.serviceAreas.length > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons name="globe-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>Service Areas: {profile.serviceAreas.join(', ')}</Text>
                  </View>
                )}
                
                {profile?.services && profile.services.length > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons name="construct-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>Services: {profile.services.join(', ')}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
        
        {/* Options */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.option} onPress={() => router.push('../intermediary/bid')}>
            <Ionicons name="clipboard-outline" size={24} color="#f59e0b" style={styles.optionIcon} />
            <Text style={styles.optionText}>My Bids</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={() => router.push('../intermediary/place-bid')}>
            <Ionicons name="pricetag-outline" size={24} color="#f59e0b" style={styles.optionIcon} />
            <Text style={styles.optionText}>Place New Bid</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={() => router.push('/intermediary')}>
            <Ionicons name="home-outline" size={24} color="#f59e0b" style={styles.optionIcon} />
            <Text style={styles.optionText}>Dashboard</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" style={styles.optionIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../intermediary/index')}
        >
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../intermediary/place-bid')}
        >
          <Ionicons name="pricetag-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>Bid</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../intermediary/bid')}
        >
          <Ionicons name="clipboard-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>My Bids</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.footerTab, styles.footerTabActive]}>
          <Ionicons name="person" size={24} color="#f59e0b" />
          <Text style={styles.footerTabTextActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  editButton: {
    padding: 8,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  businessType: {
    fontSize: 16,
    color: '#6b7280',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  infoContainer: {
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerTabActive: {
    borderTopWidth: 2,
    borderTopColor: '#f59e0b',
  },
  footerTabText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  footerTabTextActive: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
    marginTop: 4,
  },
}); 