import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'FeedbackIQ — AI Feedback Analysis',
  description: 'Analyze customer feedback instantly with AI',
  openGraph: {
    title: 'FeedbackIQ — AI Feedback Analysis',
    description: 'Analyze customer feedback instantly with AI',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FeedbackIQ — AI Feedback Analysis',
    description: 'Analyze customer feedback instantly with AI',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body>
          <Navbar />
          <div className="pt-14">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
