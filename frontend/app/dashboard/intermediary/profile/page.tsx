'use client';

import { useState } from 'react';
import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function IntermediaryProfilePage() {
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePw = useChangePassword();
  const { setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const user = data?.user;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (isLoading) return <PageSpinner />;
  if (user && !initialized) {
    setName(user.name || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setInitialized(true);
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name, phone, address }, {
      onSuccess: (res) => { setUser(res.user); addToast({ type: 'success', message: 'Profile updated!' }); },
      onError: () => addToast({ type: 'error', message: 'Failed to update profile.' }),
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePw.mutate({ currentPassword, newPassword }, {
      onSuccess: () => { addToast({ type: 'success', message: 'Password changed!' }); setCurrentPassword(''); setNewPassword(''); },
      onError: () => addToast({ type: 'error', message: 'Failed to change password.' }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="flex justify-end"><Button type="submit" loading={updateProfile.isPending}>Save Changes</Button></div>
        </form>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <div className="flex justify-end"><Button type="submit" loading={changePw.isPending} variant="outline">Change Password</Button></div>
        </form>
      </Card>
      {user?.intermediaryProfile && (
        <Card>
          <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Type:</span> <span className="font-medium">{user.intermediaryProfile.type}</span></div>
            <div><span className="text-gray-500">License:</span> <span className="font-medium">{user.intermediaryProfile.licenseNumber || 'N/A'}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Service Areas:</span> <span className="font-medium">{user.intermediaryProfile.serviceAreas?.join(', ') || 'N/A'}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Services:</span> <span className="font-medium">{user.intermediaryProfile.services?.join(', ') || 'N/A'}</span></div>
          </div>
        </Card>
      )}
    </div>
  );
}
