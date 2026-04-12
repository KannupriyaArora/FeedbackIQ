import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'FeedbackIQ',
  description: 'Intelligent feedback collection and analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
