"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormFields } from "@/components/auth/FormFields";
import { UserRole, UserFormData, ConsumerFormData, ConsumerType } from "@/types/auth";
import { apiClient } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

export default function ConsumerRegistration() {
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

  const [consumerData, setConsumerData] = useState<ConsumerFormData>({
    type: ConsumerType.END_USER,
    businessName: "",
    taxId: "",
    preferences: []
  });

  const resetForm = () => {
    setUserData({
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
    });
    setConsumerData({
      type: ConsumerType.END_USER,
      businessName: "",
      taxId: "",
      preferences: []
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

    // Validate consumer data
    if (!consumerData.type) newErrors.type = "Type is required";
    if (consumerData.type === ConsumerType.RETAILER && !consumerData.businessName) {
      newErrors.businessName = "Business name is required for retailers";
    }
    if (consumerData.type === ConsumerType.RETAILER && !consumerData.taxId) {
      newErrors.taxId = "Tax ID is required for retailers";
    }

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
        profile: consumerData,
        role: UserRole.CONSUMER
      };

      const response = await apiClient.register(registrationData);
      
      if (response.success) {
        resetForm();
        router.push("/auth/consumer/login");
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
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-lg font-semibold">Registering your account...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-purple-800">Consumer Registration</CardTitle>
            <CardDescription className="text-center text-purple-600">
              Join our platform to buy fresh produce directly from farmers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormFields
                role={UserRole.CONSUMER}
                userData={userData}
                setUserData={setUserData}
                profileData={consumerData}
                setProfileData={setConsumerData}
                errors={errors}
              />
              {errors.submit && (
                <div className="text-red-500 text-sm text-center">{errors.submit}</div>
              )}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
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