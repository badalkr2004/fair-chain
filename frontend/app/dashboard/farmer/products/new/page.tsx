'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/use-products';
import { createProductSchema, type CreateProductInput } from '@/schemas/product.schema';
import { useUIStore } from '@/stores/ui.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { addToast } = useUIStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreateProductInput>({
    name: '', description: '', category: 'GRAINS',
    quantity: 0, unit: 'kg', basePrice: 0,
    harvestDate: '', availableUntil: '', organicCertified: false, images: [],
  });

  const update = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createProductSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    createProduct.mutate(result.data as any, {
      onSuccess: () => {
        addToast({ type: 'success', message: 'Product created successfully!' });
        router.push('/dashboard/farmer/products');
      },
      onError: (err: any) => {
        addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create product.' });
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/farmer/products" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500">List your produce for sale</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product Name" placeholder="e.g. Organic Basmati Rice" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Describe your product..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" options={[...PRODUCT_CATEGORIES]} value={form.category} onChange={(e) => update('category', e.target.value)} error={errors.category} />
            <Select label="Unit" options={[...PRODUCT_UNITS]} value={form.unit} onChange={(e) => update('unit', e.target.value)} error={errors.unit} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" placeholder="100" value={form.quantity || ''} onChange={(e) => update('quantity', Number(e.target.value))} error={errors.quantity} />
            <Input label="Base Price (₹)" type="number" placeholder="50" value={form.basePrice || ''} onChange={(e) => update('basePrice', Number(e.target.value))} error={errors.basePrice} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Harvest Date" type="date" value={form.harvestDate} onChange={(e) => update('harvestDate', e.target.value)} />
            <Input label="Available Until" type="date" value={form.availableUntil} onChange={(e) => update('availableUntil', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.organicCertified} onChange={(e) => update('organicCertified', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
            <span className="text-sm text-gray-700">Organic Certified</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/farmer/products"><Button type="button" variant="ghost">Cancel</Button></Link>
            <Button type="submit" loading={createProduct.isPending}>Create Product</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
