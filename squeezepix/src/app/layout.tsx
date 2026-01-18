import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SqueezePix - Browser-Based Image Optimization',
    template: '%s | SqueezePix',
  },
  description:
    'The only all-in-one image optimizer that runs 100% in your browser. No uploads. No limits. No monthly fees. Compress, convert to WebP, remove EXIF, and generate AI alt text.',
  keywords: [
    'image optimization',
    'image compression',
    'webp converter',
    'exif removal',
    'alt text generator',
    'seo images',
    'batch image processing',
    'browser-based',
    'privacy',
  ],
  authors: [{ name: 'SqueezePix' }],
  creator: 'SqueezePix',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://squeezepix.com'),
  openGraph: {
    title: 'SqueezePix - Browser-Based Image Optimization',
    description: 'Squeeze more from your images. 100% private, 100% browser-based.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SqueezePix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SqueezePix - Browser-Based Image Optimization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SqueezePix - Browser-Based Image Optimization',
    description: 'Squeeze more from your images. 100% private, 100% browser-based.',
    images: ['/og-image.png'],
    creator: '@squeezepix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="theme-color" content="#6366F1" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="SqueezePix" />
        </head>
        <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
          {children}
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA/offline support
 */
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('SW registered:', registration.scope);
                })
                .catch(function(error) {
                  console.log('SW registration failed:', error);
                });
            });
          }
        `,
      }}
    />
  );
}
