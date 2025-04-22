"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, IntermediaryType, ConsumerType, UserFormData, FarmerFormData, IntermediaryFormData, ConsumerFormData } from "@/types/auth";
import { useState } from "react";

interface FormFieldsProps {
  role: UserRole;
  userData: UserFormData;
  setUserData: (data: UserFormData) => void;
  profileData: FarmerFormData | IntermediaryFormData | ConsumerFormData;
  setProfileData: (data: any) => void;
  errors: Record<string, string>;
}

export function FormFields({ role, userData, setUserData, profileData, setProfileData, errors }: FormFieldsProps) {
  return (
    <div className="space-y-8">
      {/* Common User Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter your address"
            value={userData.address}
            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Role-Specific Fields */}
      {role === UserRole.FARMER && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="farmSize">Farm Size (in acres)</Label>
            <Input
              id="farmSize"
              type="number"
              placeholder="Enter farm size in acres"
              value={(profileData as FarmerFormData).farmSize}
              onChange={(e) => setProfileData({ ...profileData, farmSize: parseFloat(e.target.value) })}
              className={errors.farmSize ? "border-red-500" : ""}
            />
            {errors.farmSize && <p className="text-sm text-red-500">{errors.farmSize}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="farmLocation">Farm Location</Label>
            <Input
              id="farmLocation"
              type="text"
              placeholder="Enter farm location"
              value={(profileData as FarmerFormData).farmLocation}
              onChange={(e) => setProfileData({ ...profileData, farmLocation: e.target.value })}
              className={errors.farmLocation ? "border-red-500" : ""}
            />
            {errors.farmLocation && <p className="text-sm text-red-500">{errors.farmLocation}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cropTypes">Crop Types (comma separated)</Label>
            <Textarea
              id="cropTypes"
              placeholder="Enter crop types (e.g., Wheat, Rice, Corn)"
              value={(profileData as FarmerFormData).cropTypes.join(", ")}
              onChange={(e) => setProfileData({ ...profileData, cropTypes: e.target.value.split(",").map(item => item.trim()) })}
              className={`min-h-[100px] ${errors.cropTypes ? "border-red-500" : ""}`}
            />
            {errors.cropTypes && <p className="text-sm text-red-500">{errors.cropTypes}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="certifications">Certifications (comma separated)</Label>
            <Textarea
              id="certifications"
              placeholder="Enter certifications (e.g., Organic, GAP, Fair Trade)"
              value={(profileData as FarmerFormData).certifications.join(", ")}
              onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value.split(",").map(item => item.trim()) })}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )}

      {role === UserRole.INTERMEDIARY && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="type">Intermediary Type</Label>
            <Select
              value={(profileData as IntermediaryFormData).type}
              onValueChange={(value) => setProfileData({ ...profileData, type: value as IntermediaryType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IntermediaryType.LOGISTICS}>Logistics</SelectItem>
                <SelectItem value={IntermediaryType.AGGREGATOR}>Aggregator</SelectItem>
                <SelectItem value={IntermediaryType.STORAGE}>Storage</SelectItem>
                <SelectItem value={IntermediaryType.PROCESSOR}>Processor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              type="text"
              placeholder="Enter license number"
              value={(profileData as IntermediaryFormData).licenseNumber}
              onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
              className={errors.licenseNumber ? "border-red-500" : ""}
            />
            {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="serviceAreas">Service Areas (comma separated)</Label>
            <Textarea
              id="serviceAreas"
              placeholder="Enter service areas"
              value={(profileData as IntermediaryFormData).serviceAreas.join(", ")}
              onChange={(e) => setProfileData({ ...profileData, serviceAreas: e.target.value.split(",").map(item => item.trim()) })}
              className={`min-h-[100px] ${errors.serviceAreas ? "border-red-500" : ""}`}
            />
            {errors.serviceAreas && <p className="text-sm text-red-500">{errors.serviceAreas}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storageCapacity">Storage Capacity (in tons)</Label>
            <Input
              id="storageCapacity"
              type="number"
              placeholder="Enter storage capacity"
              value={(profileData as IntermediaryFormData).capacity?.storage}
              onChange={(e) => setProfileData({ 
                ...profileData, 
                capacity: { 
                  ...(profileData as IntermediaryFormData).capacity, 
                  storage: parseFloat(e.target.value) 
                } 
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportationCapacity">Transportation Capacity (in tons)</Label>
            <Input
              id="transportationCapacity"
              type="number"
              placeholder="Enter transportation capacity"
              value={(profileData as IntermediaryFormData).capacity?.transportation}
              onChange={(e) => setProfileData({ 
                ...profileData, 
                capacity: { 
                  ...(profileData as IntermediaryFormData).capacity, 
                  transportation: parseFloat(e.target.value) 
                } 
              })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="services">Services Offered (comma separated)</Label>
            <Textarea
              id="services"
              placeholder="Enter services offered"
              value={(profileData as IntermediaryFormData).services.join(", ")}
              onChange={(e) => setProfileData({ ...profileData, services: e.target.value.split(",").map(item => item.trim()) })}
              className={`min-h-[100px] ${errors.services ? "border-red-500" : ""}`}
            />
            {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
          </div>
        </div>
      )}

      {role === UserRole.CONSUMER && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="type">Consumer Type</Label>
            <Select
              value={(profileData as ConsumerFormData).type}
              onValueChange={(value) => setProfileData({ ...profileData, type: value as ConsumerType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConsumerType.RETAILER}>Retailer</SelectItem>
                <SelectItem value={ConsumerType.END_USER}>End User</SelectItem>
                <SelectItem value={ConsumerType.BULK_BUYER}>Bulk Buyer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(profileData as ConsumerFormData).type === ConsumerType.RETAILER && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter business name"
                  value={(profileData as ConsumerFormData).businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                  className={errors.businessName ? "border-red-500" : ""}
                />
                {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  type="text"
                  placeholder="Enter tax ID"
                  value={(profileData as ConsumerFormData).taxId}
                  onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                  className={errors.taxId ? "border-red-500" : ""}
                />
                {errors.taxId && <p className="text-sm text-red-500">{errors.taxId}</p>}
              </div>
            </>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="preferences">Product Preferences (comma separated)</Label>
            <Textarea
              id="preferences"
              placeholder="Enter product preferences"
              value={(profileData as ConsumerFormData).preferences.join(", ")}
              onChange={(e) => setProfileData({ ...profileData, preferences: e.target.value.split(",").map(item => item.trim()) })}
              className={`min-h-[100px] ${errors.preferences ? "border-red-500" : ""}`}
            />
            {errors.preferences && <p className="text-sm text-red-500">{errors.preferences}</p>}
          </div>
        </div>
      )}
    </div>
  );
} 