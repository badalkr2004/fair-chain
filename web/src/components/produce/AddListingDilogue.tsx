"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Calendar, Scale, IndianRupee, MapPin, Info, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/lib/api/types";
import { useRouter } from "next/navigation";

export function AddListingDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "GRAINS",
    quantity: 0,
    unit: "kg",
    basePrice: 0,
    status: "DRAFT",
    harvestDate: new Date().toISOString().split('T')[0],
    availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    organicCertified: false,
    location: null,
    farmerId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const userData = JSON.parse(atob(token.split('.')[1]));
      const farmerId = userData.id;

      const formDataToSend = new FormData();
      
      selectedImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.category) formDataToSend.append('category', formData.category);
      if (formData.quantity !== undefined) formDataToSend.append('quantity', formData.quantity.toString());
      if (formData.unit) formDataToSend.append('unit', formData.unit);
      if (formData.basePrice !== undefined) formDataToSend.append('basePrice', formData.basePrice.toString());
      if (formData.harvestDate) formDataToSend.append('harvestDate', formData.harvestDate);
      if (formData.availableUntil) formDataToSend.append('availableUntil', formData.availableUntil);
      if (formData.organicCertified !== undefined) formDataToSend.append('organicCertified', formData.organicCertified.toString());
      formDataToSend.append('farmerId', farmerId);
      formDataToSend.append('status', 'DRAFT');

      const response = await apiClient.createProduce(formDataToSend);

      if (response.success) {
        toast({
          title: "Success",
          description: "Product listing created successfully",
        });
        setIsOpen(false);
        setFormData({
          name: "",
          description: "",
          category: "GRAINS",
          quantity: 0,
          unit: "kg",
          basePrice: 0,
          status: "DRAFT",
          harvestDate: new Date().toISOString().split('T')[0],
          availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          organicCertified: false,
          location: null,
          farmerId: "",
        });
        setSelectedImages([]);
        router.push('/farmer/dashboard');
      } else {
        throw new Error(response.message || 'Failed to create product listing');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create product listing',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" />
          Add New Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none w-[98vw] h-screen m-0 rounded-none">
        <DialogHeader className="px-16 pt-8">
          <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Produce Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-[1.2fr,2.8fr] gap-20 p-16 h-[calc(100vh-8rem)] overflow-y-auto">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-medium text-gray-700">Product Images</Label>
              <div 
                className="flex h-[600px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {selectedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 p-6 w-full h-full">
                    {selectedImages.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Selected ${index + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-base text-gray-600">
                    <Upload className="h-14 w-14 text-emerald-600" />
                    <span className="text-xl">Click to upload product images</span>
                    <span className="text-sm text-gray-500">Recommended size: 800x600px</span>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-10">
            {/* Basic Information */}
            <div className="space-y-8">
              <h3 className="text-2xl font-medium text-gray-900">Basic Information</h3>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-lg font-medium text-gray-700">Product Name</Label>
                  <div className="relative">
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name" 
                      className="pl-10 h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <Plus className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="category" className="text-lg font-medium text-gray-700">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Product["category"] }))}
                  >
                    <SelectTrigger className="h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRAINS">Grains</SelectItem>
                      <SelectItem value="VEGETABLES">Vegetables</SelectItem>
                      <SelectItem value="FRUITS">Fruits</SelectItem>
                      <SelectItem value="DAIRY">Dairy</SelectItem>
                      <SelectItem value="MEAT">Meat</SelectItem>
                      <SelectItem value="POULTRY">Poultry</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="description" className="text-lg font-medium text-gray-700">Description</Label>
                  <div className="relative">
                    <Input 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter product description" 
                      className="pl-10 h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <Info className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing and Quantity */}
            <div className="space-y-8">
              <h3 className="text-2xl font-medium text-gray-900">Pricing & Quantity</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="quantity" className="text-lg font-medium text-gray-700">Quantity</Label>
                  <div className="relative">
                    <Input 
                      id="quantity" 
                      name="quantity"
                      type="number" 
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity" 
                      className="pl-10 h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                      min="0"
                    />
                    <Scale className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="unit" className="text-lg font-medium text-gray-700">Unit</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger className="h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="basePrice" className="text-lg font-medium text-gray-700">Base Price</Label>
                  <div className="relative">
                    <Input 
                      id="basePrice" 
                      name="basePrice"
                      type="number" 
                      value={formData.basePrice}
                      onChange={handleChange}
                      placeholder="Enter base price" 
                      className="pl-10 h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                      min="0"
                    />
                    <IndianRupee className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-8">
              <h3 className="text-2xl font-medium text-gray-900">Dates</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="harvestDate" className="text-lg font-medium text-gray-700">Harvest Date</Label>
                  <div className="relative">
                    <Input 
                      id="harvestDate" 
                      name="harvestDate"
                      type="date" 
                      value={formData.harvestDate}
                      onChange={handleChange}
                      className="pl-10 h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <Calendar className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="availableUntil" className="text-lg font-medium text-gray-700">Available Until</Label>
                  <div className="relative">
                    <Input 
                      id="availableUntil" 
                      name="availableUntil"
                      type="date" 
                      value={formData.availableUntil}
                      onChange={handleChange}
                      className="pl-10 h-14 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <Calendar className="absolute left-3 top-4 h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              <h3 className="text-2xl font-medium text-gray-900">Additional Information</h3>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="organicCertified"
                  name="organicCertified"
                  checked={formData.organicCertified}
                  onChange={handleChange}
                  className="h-6 w-6 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor="organicCertified" className="text-lg font-medium text-gray-700">
                  Organic Certified
                </Label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-6 pt-12">
              <Button 
                type="submit" 
                className="flex-1 h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-14 text-lg border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
