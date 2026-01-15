import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAWrapper from "@/components/PWAWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "loanaticks - Home Mortgage Solutions",
  description: "Professional mortgage lending platform with competitive rates, fast approvals, and expert guidance for your home financing needs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "loanaticks",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#EAB308",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EAB308" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="loanaticks" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PWAWrapper>{children}</PWAWrapper>
      </body>
    </html>
  );
}
