import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"

import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { getProductById } from '../../services/products';
import { createOrder } from '../../services/orders';
import { authService } from '../../services';
import { UserRole } from '../../services/auth';

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState('1');
    const [user, setUser] = useState<any>(null);
    const [orderLoading, setOrderLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);

                const productData = await getProductById(id as string);
                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product:', error);
                Alert.alert('Error', 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePlaceOrder = async () => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please log in to place an order');
            router.push('/login');
            return;
        }

        if (user.role !== UserRole.CONSUMER) {
            Alert.alert('Not Authorized', 'Only consumers can place orders');
            return;
        }

        const qtyValue = parseInt(quantity);
        if (isNaN(qtyValue) || qtyValue <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
            return;
        }

        if (qtyValue > product.quantity) {
            Alert.alert('Invalid Quantity', `Only ${product.quantity} ${product.unit}s available`);
            return;
        }

        try {
            setOrderLoading(true);
            await createOrder({
                items: [
                    {
                        productId: product.id,
                        quantity: qtyValue
                    }
                ]
            });

            Alert.alert(
                'Order Placed Successfully',
                'Your order has been placed successfully',
                [{ text: 'View Orders', onPress: () => router.push('/orders') }, { text: 'OK' }]
            );
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Failed to place order');
        } finally {
            setOrderLoading(false);
        }
    };

    const handleBidOnProduct = () => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please log in to place a bid');
            router.push('/login');
            return;
        }

        if (user.role !== UserRole.INTERMEDIARY) {
            Alert.alert('Not Authorized', 'Only intermediaries can place bids');
            return;
        }

        router.push(`/bids/create?productId=${product.id}`);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'LISTED': return 'success';
            case 'SOLD': return 'warning';
            case 'PROCESSING': return 'info';
            case 'EXPIRED': return 'error';
            case 'CANCELLED': return 'error';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Spinner size="large" />
                <Text style={styles.loadingText}>Loading product details...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
                <Text style={styles.errorText}>Product not found</Text>
                <Button onPress={() => router.back()}>
                    <Button.Text>Go Back</Button.Text>
                </Button>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Product Images */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                {product.images && product.images.length > 0 ? (
                    product.images.map((image: string, index: number) => (
                        <Image key={index} source={{ uri: image }} style={styles.productImage} />
                    ))
                ) : (
                    <Image source={require('../../assets/default-product.png')} style={styles.productImage} />
                )}
            </ScrollView>

            {/* Product Details */}
            <View style={styles.detailsContainer}>
                <HStack space="md" alignItems="center">
                    <Badge variant="solid" action={getStatusBadgeColor(product.status)} size="sm">
                        <Badge.Text>{product.status}</Badge.Text>
                    </Badge>
                    <Text style={styles.category}>{product.category}</Text>
                </HStack>

                <Text style={styles.productName}>{product.name}</Text>

                <HStack space="md" alignItems="center" marginTop={10}>
                    <FontAwesome5 name="user-circle" size={16} color="#666" />
                    <Text style={styles.farmerName}>
                        By Farmer {product.farmer ? product.farmer.name : 'Unknown'}
                    </Text>
                </HStack>

                <Text style={styles.price}>
                    ${product.finalPrice || product.basePrice} / {product.unit}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{product.description || 'No description available'}</Text>

                <View style={styles.infoContainer}>
                    <HStack space="md" alignItems="center" marginTop={8}>
                        <Entypo name="calendar" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Harvest Date: {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'Not specified'}
                        </Text>
                    </HStack>

                    <HStack space="md" alignItems="center" marginTop={8}>
                        <MaterialIcons name="inventory" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Available: {product.quantity} {product.unit}s
                        </Text>
                    </HStack>

                    {product.organicCertified && (
                        <Box marginTop={8} backgroundColor="rgba(0, 150, 0, 0.1)" padding={8} borderRadius={8}>
                            <HStack space="sm" alignItems="center">
                                <FontAwesome5 name="leaf" size={16} color="green" />
                                <Text style={styles.organicText}>Organically Certified</Text>
                            </HStack>
                        </Box>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Order Section */}
                {product.status === 'LISTED' && (
                    <View style={styles.orderSection}>
                        <Text style={styles.sectionTitle}>Place an Order</Text>

                        <HStack space="md" alignItems="center" marginTop={10}>
                            <Text style={styles.quantityLabel}>Quantity:</Text>
                            <Input
                                flex={1}
                                keyboardType="numeric"
                                value={quantity}
                                onChangeText={setQuantity}
                                maxLength={5}
                            />
                            <Text style={styles.unitText}>{product.unit}s</Text>
                        </HStack>

                        <Text style={styles.totalText}>
                            Total: ${((parseFloat(quantity) || 0) * (product.finalPrice || product.basePrice)).toFixed(2)}
                        </Text>

                        <HStack space="md" marginTop={16}>
                            {user?.role === UserRole.CONSUMER && (
                                <Button
                                    onPress={handlePlaceOrder}
                                    isDisabled={orderLoading}
                                    flex={1}
                                    variant="solid"
                                    action="positive"
                                >
                                    {orderLoading ? <Spinner size="small" color="white" /> : <Button.Text>Place Order</Button.Text>}
                                </Button>
                            )}

                            {user?.role === UserRole.INTERMEDIARY && (
                                <Button
                                    onPress={handleBidOnProduct}
                                    flex={1}
                                    variant="outline"
                                    action="secondary"
                                >
                                    <Button.Text>Place Bid</Button.Text>
                                </Button>
                            )}
                        </HStack>
                    </View>
                )}

                {/* Traceability Button */}
                <TouchableOpacity
                    style={styles.traceabilityButton}
                    onPress={() => router.push(`/traceability/${product.id}`)}
                >
                    <HStack space="sm" alignItems="center">
                        <MaterialIcons name="timeline" size={24} color="#4285F4" />
                        <VStack>
                            <Text style={styles.traceabilityTitle}>View Supply Chain</Text>
                            <Text style={styles.traceabilitySubtitle}>Track this product's journey</Text>
                        </VStack>
                        <MaterialIcons name="chevron-right" size={24} color="#4285F4" style={{ marginLeft: 'auto' }} />
                    </HStack>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '500',
        marginVertical: 16,
        color: '#444',
    },
    imageContainer: {
        height: 300,
    },
    productImage: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
    },
    detailsContainer: {
        padding: 16,
    },
    category: {
        fontSize: 14,
        color: '#666',
        textTransform: 'uppercase',
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#222',
    },
    farmerName: {
        fontSize: 14,
        color: '#666',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#4285F4',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    infoContainer: {
        marginTop: 16,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    organicText: {
        fontSize: 14,
        color: 'green',
        fontWeight: '500',
    },
    orderSection: {
        marginBottom: 16,
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        width: 80,
    },
    unitText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    totalText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        color: '#444',
        textAlign: 'right',
    },
    traceabilityButton: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e1e7ef',
    },
    traceabilityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4285F4',
    },
    traceabilitySubtitle: {
        fontSize: 12,
        color: '#666',
    },
}); 