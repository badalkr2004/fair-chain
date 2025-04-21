export const getCropImage = (cropName: string): string => {
  const cropImages: Record<string, string> = {
    // Grains
    'wheat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'rice': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'maize': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'millet': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    
    // Vegetables
    'tomato': 'https://images.unsplash.com/photo-1592841200221-1907caa5814e?w=800&auto=format&fit=crop&q=60',
    'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=60',
    'onion': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'carrot': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    
    // Fruits
    'apple': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'banana': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'mango': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    'orange': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60',
    
    // Default image
    'default': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60'
  };

  const normalizedCropName = cropName.toLowerCase();
  return cropImages[normalizedCropName] || cropImages.default;
}; 