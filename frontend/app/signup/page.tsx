'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import * as authService from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { INTERMEDIARY_TYPES, CONSUMER_TYPES } from '@/lib/constants';
import type { UserRole } from '@/types';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email: '', password: '', name: '',
    role: (searchParams.get('role') as UserRole) || 'FARMER' as UserRole,
    phone: '', address: '',
    // Farmer
    farmSize: '', farmLocation: '', cropTypes: '',
    // Intermediary
    intermediaryType: 'LOGISTICS', serviceAreas: '', services: '', licenseNumber: '',
    // Consumer
    consumerType: 'END_USER', businessName: '',
  });

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }

    setLoading(true);
    setErrors({});

    try {
      let profileData: Record<string, unknown> = {};
      if (form.role === 'FARMER') {
        profileData = {
          farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined,
          farmLocation: form.farmLocation,
          cropTypes: form.cropTypes.split(',').map((s) => s.trim()).filter(Boolean),
          certifications: [],
        };
      } else if (form.role === 'INTERMEDIARY') {
        profileData = {
          type: form.intermediaryType,
          serviceAreas: form.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
          services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
          licenseNumber: form.licenseNumber,
        };
      } else {
        profileData = {
          type: form.consumerType,
          businessName: form.businessName,
          preferences: [],
        };
      }

      const data = await authService.signup({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        phone: form.phone,
        address: form.address,
        profileData,
      } as any);

      login(data.user, data.token, data.refreshToken);
      addToast({ type: 'success', message: 'Account created successfully!' });
      router.push(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setErrors({ form: msg });
      addToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'FARMER', label: 'Farmer' },
    { value: 'INTERMEDIARY', label: 'Intermediary' },
    { value: 'CONSUMER', label: 'Consumer' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF5] px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-800">FairChain</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Step {step} of 2</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{errors.form}</div>
            )}

            {step === 1 && (
              <>
                <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
                <Select label="Role" options={roles} value={form.role} onChange={(e) => updateField('role', e.target.value)} />
                <Input label="Phone" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                <Input label="Address" placeholder="City, State" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                <Button type="submit" className="w-full" size="lg">Next: Profile Details</Button>
              </>
            )}

            {step === 2 && (
              <>
                {form.role === 'FARMER' && (
                  <>
                    <Input label="Farm Size (acres)" type="number" value={form.farmSize} onChange={(e) => updateField('farmSize', e.target.value)} />
                    <Input label="Farm Location" placeholder="Village, District" value={form.farmLocation} onChange={(e) => updateField('farmLocation', e.target.value)} />
                    <Input label="Crop Types" placeholder="Rice, Wheat, Tomato" hint="Comma-separated" value={form.cropTypes} onChange={(e) => updateField('cropTypes', e.target.value)} />
                  </>
                )}
                {form.role === 'INTERMEDIARY' && (
                  <>
                    <Select label="Type" options={[...INTERMEDIARY_TYPES]} value={form.intermediaryType} onChange={(e) => updateField('intermediaryType', e.target.value)} />
                    <Input label="Service Areas" placeholder="Bihar, UP" hint="Comma-separated" value={form.serviceAreas} onChange={(e) => updateField('serviceAreas', e.target.value)} />
                    <Input label="Services Offered" placeholder="Transport, Cold Storage" hint="Comma-separated" value={form.services} onChange={(e) => updateField('services', e.target.value)} />
                    <Input label="License Number" placeholder="Optional" value={form.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} />
                  </>
                )}
                {form.role === 'CONSUMER' && (
                  <>
                    <Select label="Consumer Type" options={[...CONSUMER_TYPES]} value={form.consumerType} onChange={(e) => updateField('consumerType', e.target.value)} />
                    <Input label="Business Name" placeholder="Optional" value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} />
                  </>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1" size="lg">Back</Button>
                  <Button type="submit" loading={loading} className="flex-1" size="lg">Create Account</Button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-500">Loading...</span></div>}>
      <SignupForm />
    </Suspense>
  );
}
