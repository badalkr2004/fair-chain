"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api/client";
import { UserRole } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: UserRole.FARMER
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        
        // Update auth store
        useAuthStore.getState().setAuth(user, token, refreshToken);

        // Show success message
        toast({
          title: "Success",
          description: "Logged in successfully",
        });

        // Redirect based on role
        switch (user.role) {
          case UserRole.FARMER:
            router.push('/farmer/dashboard');
            break;
          case UserRole.CONSUMER:
            router.push('/consumer/dashboard');
            break;
          case UserRole.BUYER:
            router.push('/buyer/dashboard');
            break;
          case UserRole.ADMIN:
            router.push('/admin/dashboard');
            break;
          default:
            throw new Error('Invalid user role');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Login failed',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 