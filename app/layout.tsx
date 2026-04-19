import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAWrapper from "@/components/PWAWrapper";
import Providers from "@/components/Providers";
import { auth } from "@/lib/auth";

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
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#EAB308",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no,date=no,address=no,email=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EAB308" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="loanaticks" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          <PWAWrapper>{children}</PWAWrapper>
        </Providers>
      </body>
    </html>
  );
}
