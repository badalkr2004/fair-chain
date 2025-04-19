"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Calendar, Scale, IndianRupee } from "lucide-react";
import { useState } from "react";

export function AddListingDialog() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" />
          Add New Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[600px] overflow-y-auto border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Produce Listing</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6 py-4">
          {/* Left side - Image upload */}
          <div className="w-1/3">
            <Label className="text-sm font-medium text-gray-700">Images</Label>
            <div 
              className="flex h-64 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                  <Upload className="h-6 w-6 text-emerald-600" />
                  <span>Click to upload image</span>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Right side - Form fields */}
          <div className="w-2/3 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Crop Name</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  placeholder="Enter crop name" 
                  className="pl-8 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Plus className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity (kg)</Label>
              <div className="relative">
                <Input 
                  id="quantity" 
                  type="number" 
                  placeholder="Enter quantity" 
                  className="pl-8 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Scale className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price per kg (₹)</Label>
              <div className="relative">
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="Enter price" 
                  className="pl-8 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="harvestDate" className="text-sm font-medium text-gray-700">Harvest Date</Label>
              <div className="relative">
                <Input 
                  id="harvestDate" 
                  type="date" 
                  className="pl-8 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Create Listing
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
