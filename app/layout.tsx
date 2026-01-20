import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["100", "900"],
});

export const metadata: Metadata = {
  title: "SCOUTER - 建設業要注意人物共有システム",
  description: "Construction Industry Scouter System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-black text-scouter-green overflow-x-hidden min-h-screen selection:bg-scouter-green selection:text-black">
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06)_1px,transparent_0),linear-gradient(rgba(255,0,0,0.06)_1px,transparent_0)] bg-[length:100%_2px,20px_20px,20px_20px]"></div>
        <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,255,0,0.05)_100%)]"></div>
        <Navigation />
        <main className="relative z-10">{children}</main>
        <footer className="relative z-10 py-8 text-center text-scouter-green/50 text-xs font-mono border-t border-scouter-green/20 mt-12">
          <p>&copy; 2024 SCOUTER SYSTEM. ALL RIGHTS RESERVED.</p>
        </footer>
      </body>
    </html>
  );
}
