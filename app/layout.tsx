import './globals.css';

import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Outfit } from 'next/font/google';
import { Suspense } from 'react';
import { ThemeProvider } from '@/providers/theme';

const outfit = Outfit({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ai Navigator',
  description: 'Ai Navigator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>
        <Suspense>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
