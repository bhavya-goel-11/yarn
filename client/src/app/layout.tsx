import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Yarn Flight Savings Engine',
  description: 'Stack coupons, card perks, and loyalty credits for the best flight price.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
