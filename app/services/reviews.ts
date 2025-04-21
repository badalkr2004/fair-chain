import api from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  product?: any;
  user?: any;
}

export interface ReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating: number;
  comment: string;
}

/**
 * Get all reviews
 */
export const getAllReviews = async () => {
  try {
    return await api.get('/reviews');
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific product
 */
export const getProductReviews = async (productId: string) => {
  try {
    return await api.get(`/reviews/product/${productId}`);
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get reviews written by the current user
 */
export const getMyReviews = async () => {
  try {
    return await api.get('/reviews/my');
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    throw error;
  }
};

/**
 * Get a specific review by ID
 */
export const getReviewById = async (reviewId: string) => {
  try {
    return await api.get(`/reviews/${reviewId}`);
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Add a new review
 */
export const addReview = async (reviewData: ReviewData) => {
  try {
    return await api.post('/reviews', reviewData);
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (reviewId: string, reviewData: UpdateReviewData) => {
  try {
    return await api.put(`/reviews/${reviewId}`, reviewData);
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string) => {
  try {
    return await api.delete(`/reviews/${reviewId}`);
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Get review statistics for a product
 */
export const getProductReviewStats = async (productId: string) => {
  try {
    return await api.get(`/reviews/product/${productId}/stats`);
  } catch (error) {
    console.error(`Error fetching review stats for product ${productId}:`, error);
    throw error;
  }
};
