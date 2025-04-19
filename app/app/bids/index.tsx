import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getBidsForProduct, getMyBids, Bid, respondToBid, cancelBid } from '../../services/bids';
import { getMyProducts } from '../../services/products';
import { authService } from '../../services';
import { UserRole } from '../../services/auth';

interface BidWithExtra extends Bid {
  expanded?: boolean;
}

const BidStatusColors = {
  PENDING: '#FFC107',
  ACCEPTED: '#4CAF50',
  REJECTED: '#F44336',
  CANCELLED: '#9E9E9E',
  EXPIRED: '#9E9E9E'
};

export default function BidsScreen() {
  const router = useRouter();
  const [bids, setBids] = useState<BidWithExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        if (!userData) {
          Alert.alert('Authentication Required', 'Please log in to view bids');
          router.push('/login');
          return;
        }
        
        if (userData.role === UserRole.FARMER) {
          // Farmers need to select a product to view bids for
          const myProducts = await getMyProducts();
          setProducts(myProducts || []);
          
          if (myProducts && myProducts.length > 0) {
            setSelectedProductId(myProducts[0].id);
            const productBids = await getBidsForProduct(myProducts[0].id);
            setBids(productBids || []);
          }
        } else if (userData.role === UserRole.INTERMEDIARY) {
          // Intermediaries see all their bids
          const myBids = await getMyBids();
          setBids(myBids || []);
        } else {
          Alert.alert('Not Authorized', 'Your account type cannot access bids');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching bids:', error);
        Alert.alert('Error', 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSelectProduct = async (productId: string) => {
    try {
      setLoading(true);
      setSelectedProductId(productId);
      
      const productBids = await getBidsForProduct(productId);
      setBids(productBids || []);
    } catch (error) {
      console.error('Error fetching bids for product:', error);
      Alert.alert('Error', 'Failed to load bids for selected product');
    } finally {
      setLoading(false);
    }
  };

  const toggleBidExpanded = (bidId: string) => {
    setBids(prev => 
      prev.map(bid => 
        bid.id === bidId
          ? { ...bid, expanded: !bid.expanded }
          : bid
      )
    );
  };

  const handleRespondToBid = async (bidId: string, accept: boolean) => {
    try {
      setLoading(true);
      
      await respondToBid(bidId, {
        status: accept ? 'ACCEPTED' : 'REJECTED',
        responseReason: accept 
          ? 'Your bid has been accepted.' 
          : 'Your bid has been rejected.'
      });
      
      // Refresh bids list
      if (selectedProductId) {
        const updatedBids = await getBidsForProduct(selectedProductId);
        setBids(updatedBids || []);
      }
      
      Alert.alert(
        'Success', 
        `Bid ${accept ? 'accepted' : 'rejected'} successfully`,
      );
    } catch (error) {
      console.error('Error responding to bid:', error);
      Alert.alert('Error', 'Failed to respond to bid');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBid = async (bidId: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this bid?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              await cancelBid(bidId);
              
              // Refresh bids list
              const updatedBids = await getMyBids();
              setBids(updatedBids || []);
              
              Alert.alert('Success', 'Bid cancelled successfully');
            } catch (error) {
              console.error('Error cancelling bid:', error);
              Alert.alert('Error', 'Failed to cancel bid');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderBidItem = ({ item }: { item: BidWithExtra }) => (
    <View style={styles.bidCard}>
      <TouchableOpacity 
        style={styles.bidHeader}
        onPress={() => toggleBidExpanded(item.id)}
      >
        <View style={styles.bidInfo}>
          <Text style={styles.productName}>{item.product?.name || 'Product'}</Text>
          <Text style={styles.bidMeta}>
            {item.quantity} {item.product?.unit || 'units'} at ${item.price}/{item.product?.unit || 'unit'}
          </Text>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
        </View>
        
        <View style={styles.bidStatus}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: BidStatusColors[item.status as keyof typeof BidStatusColors] }
          ]} />
          <Text style={styles.statusText}>{item.status}</Text>
          <MaterialIcons 
            name={item.expanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>
      
      {item.expanded && (
        <View style={styles.bidDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{item.quantity} {item.product?.unit || 'units'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>${item.price}/{item.product?.unit || 'unit'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Value:</Text>
            <Text style={styles.detailValue}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Valid Until:</Text>
            <Text style={styles.detailValue}>{formatDate(item.validUntil)}</Text>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          
          {item.terms && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.detailLabel}>Additional Terms:</Text>
              <Text style={styles.description}>{item.terms}</Text>
            </View>
          )}
          
          {/* Action buttons based on user role and bid status */}
          {user?.role === UserRole.FARMER && item.status === 'PENDING' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleRespondToBid(item.id, true)}
              >
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRespondToBid(item.id, false)}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {user?.role === UserRole.INTERMEDIARY && item.status === 'PENDING' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelBid(item.id)}
              >
                <Text style={styles.actionButtonText}>Cancel Bid</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Response reason (if any) */}
          {item.responseReason && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Response:</Text>
              <Text style={styles.responseText}>{item.responseReason}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderProductSelector = () => {
    if (user?.role !== UserRole.FARMER || products.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.productSelector}>
        <Text style={styles.selectorLabel}>Select Product:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productOption,
                selectedProductId === product.id && styles.selectedProduct
              ]}
              onPress={() => handleSelectProduct(product.id)}
            >
              <Text 
                style={[
                  styles.productOptionText,
                  selectedProductId === product.id && styles.selectedProductText
                ]}
                numberOfLines={1}
              >
                {product.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Bids Found</Text>
      <Text style={styles.emptySubtitle}>
        {user?.role === UserRole.FARMER 
          ? 'You haven\'t received any bids for this product yet.'
          : 'You haven\'t placed any bids yet.'}
      </Text>
      
      {user?.role === UserRole.INTERMEDIARY && (
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => router.push('/products')}
        >
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.role === UserRole.FARMER ? 'Received Bids' : 'My Bids'}
        </Text>
      </View>
      
      {renderProductSelector()}
      
      <FlatList
        data={bids}
        renderItem={renderBidItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bidsList}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  productSelector: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  productOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedProduct: {
    backgroundColor: '#4285F4',
  },
  productOptionText: {
    color: '#555',
  },
  selectedProductText: {
    color: 'white',
    fontWeight: '500',
  },
  bidsList: {
    padding: 16,
    flexGrow: 1,
  },
  bidCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bidHeader: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bidMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  serviceType: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  bidStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginRight: 4,
  },
  bidDetails: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  responseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 