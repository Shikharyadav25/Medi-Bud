import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Medi Bud AI",
  description: "Your AI-powered health companion",
  icons: {
    icon: "/stethoscope.svg",
  },
};

import Navbar from "@/components/Navbar";
import VoiceNavigator from "@/components/VoiceNavigator";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ADD THIS LINE */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Space+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
     <body
  className="min-h-full flex flex-col pt-[70px]"
  suppressHydrationWarning
>
  <Navbar />
  <VoiceNavigator />
  {children}
</body>
    </html>
  );
}
