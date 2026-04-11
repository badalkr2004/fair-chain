'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as traceService from '@/services/traceability.service';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import { Search, MapPin, BadgeCheck, CheckCircle2 } from 'lucide-react';

export default function TraceabilitySearchPage() {
  const [searchId, setSearchId] = useState('');
  const [submitId, setSubmitId] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['traceability', submitId],
    queryFn: () => traceService.getProductTraceability(submitId),
    enabled: !!submitId,
    retry: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) setSubmitId(searchId.trim());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trace Your Product</h1>
        <p className="text-gray-500">Enter a Product ID or Tracking Hash to view its complete journey.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex items-end gap-3">
          <div className="flex-1">
            <Input 
              label="Tracking ID or Product Hash" 
              placeholder="e.g. prd_123456789" 
              value={searchId} 
              onChange={(e) => setSearchId(e.target.value)} 
            />
          </div>
          <Button type="submit" className="pb-2.5 pt-3"><Search className="w-5 h-5 mr-2" /> Search</Button>
        </form>
      </Card>

      {isLoading && <PageSpinner />}

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 text-center py-8">
          <p>Product or tracking record not found. Please verify the ID and try again.</p>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-800 text-white border-0">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-2 inline-block">Verified Product</span>
                <h2 className="text-2xl font-bold">{data.product.name}</h2>
                <div className="flex items-center gap-2 text-green-100 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>Farm: {data.product.farmer.name} {data.product.farmer.location ? `(${data.product.farmer.location})` : ''}</span>
                </div>
              </div>
              {data.product.organicCertified && (
                <div className="flex flex-col items-center justify-center bg-white/10 p-3 rounded-xl border border-white/20">
                  <BadgeCheck className="w-8 h-8 text-green-300 mb-1" />
                  <span className="text-xs font-medium">Organic</span>
                </div>
              )}
            </div>
          </Card>

          <h3 className="text-lg font-bold text-gray-900 px-1">Supply Chain Journey</h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {data.timeline.map((event, i) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                
                <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">{event.eventType.replace(/_/g, ' ')}</h4>
                  </div>
                  <time className="text-xs font-medium text-green-600 mb-2 block">{formatDateTime(event.timestamp)}</time>
                  <div className="text-sm text-gray-600 mb-2">
                    {event.location ? (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {JSON.stringify(event.location)}</span>
                    ) : 'Location verified'}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-400 p-2 break-all font-mono">
                    Hash: {event.hash?.substring(0, 32)}...
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
