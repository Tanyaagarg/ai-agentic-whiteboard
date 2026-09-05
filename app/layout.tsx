import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import Provider from './provider';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from '@/components/ui/toast';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "WhizBoard — AI whiteboard for ideas that move",
  description:
    "Sketch, diagram and plan on an infinite canvas. Describe what you need and WhizBoard draws it for you.",
  icons: { icon: "/logo.svg" },
};

const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !!process.env.CLERK_SECRET_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isClerkConfigured) {
    return (
      <html lang="en" className={cn("font-sans", inter.variable)}>
        <body style={{ margin: 0, padding: 0 }}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>
            {children}
          </Provider>
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
