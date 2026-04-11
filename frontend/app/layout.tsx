import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import ToastContainer from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'FairChain — AI-Powered Transparent Agri-Marketplace',
  description: 'Connecting farmers, intermediaries, and consumers through a transparent agricultural supply chain with AI-powered demand forecasting and end-to-end traceability.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
