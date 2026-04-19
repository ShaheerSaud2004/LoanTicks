import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "LOANATICKS - Home Mortgage Solutions",
    short_name: "LOANATICKS",
    description: "Professional mortgage lending platform with competitive rates, fast approvals, and expert guidance",
    start_url: "/",
    display: "standalone",
    background_color: "#374151",
    theme_color: "#EAB308",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ],
    categories: ["finance", "business"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to your dashboard",
        url: "/customer/dashboard",
        icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }]
      },
      {
        name: "Apply for Loan",
        short_name: "Apply",
        description: "Start a new loan application",
        url: "/customer/loan-application",
        icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }]
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
