import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Night Call Audio — Premium Plugins & Presets",
  description: "Professional music production plugins, presets, and sample packs for producers and beatmakers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jakarta.variable} ${jetbrains.variable} ${notoSansKr.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg-deep text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}
