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
      <body className="font-sans antialiased bg-white text-scouter-green overflow-x-hidden min-h-screen selection:bg-scouter-green selection:text-slate-900">
        <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,229,255,0.05)_100%)]"></div>
        <Navigation />
        <main className="relative z-10">{children}</main>
        <footer className="relative z-10 py-8 text-center text-scouter-green/50 text-xs font-mono border-t border-scouter-green/20 mt-12">
          <p>&copy; 2024 SCOUTER SYSTEM. ALL RIGHTS RESERVED.</p>
        </footer>
      </body>
    </html>
  );
}
