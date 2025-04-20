"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormFields } from "@/components/auth/FormFields";
import { UserRole, UserFormData, FarmerFormData } from "@/types/auth";
import { apiClient } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

export default function FarmerRegistration() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [userData, setUserData] = useState<UserFormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });

  const [farmerData, setFarmerData] = useState<FarmerFormData>({
    farmSize: 0,
    farmLocation: "",
    cropTypes: [],
    certifications: []
  });

  const resetForm = () => {
    setUserData({
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
    });
    setFarmerData({
      farmSize: 0,
      farmLocation: "",
      cropTypes: [],
      certifications: []
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate user data
    if (!userData.email) newErrors.email = "Email is required";
    if (!userData.password) newErrors.password = "Password is required";
    if (!userData.name) newErrors.name = "Name is required";
    if (!userData.phone) newErrors.phone = "Phone number is required";
    if (!userData.address) newErrors.address = "Address is required";

    // Validate farmer data
    if (!farmerData.farmSize || farmerData.farmSize <= 0) newErrors.farmSize = "Farm size is required";
    if (!farmerData.farmLocation) newErrors.farmLocation = "Farm location is required";
    if (farmerData.cropTypes.length === 0) newErrors.cropTypes = "At least one crop type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const registrationData = {
        user: userData,
        profile: farmerData,
        role: UserRole.FARMER
      };

      const response = await apiClient.register(registrationData);
      
      if (response.success) {
        resetForm();
        router.push("/auth/farmer/login");
      } else {
        setErrors({ submit: response.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "An error occurred during registration" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-lg font-semibold">Registering your account...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-green-800">Farmer Registration</CardTitle>
            <CardDescription className="text-center text-green-600">
              Join our platform to connect with consumers and sell your fresh produce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormFields
                role={UserRole.FARMER}
                userData={userData}
                setUserData={setUserData}
                profileData={farmerData}
                setProfileData={setFarmerData}
                errors={errors}
              />
              {errors.submit && (
                <div className="text-red-500 text-sm text-center">{errors.submit}</div>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 