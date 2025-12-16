// 일일공방 (Daily Workshop) 루트 레이아웃
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Google Fonts 설정
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 메타데이터 설정
export const metadata: Metadata = {
  title: "일일공방 (Daily Workshop) - 조합 게임",
  description: "창의적인 조합으로 새로운 원소를 발견하세요! 물, 불, 흙, 공기에서 시작하여 무한한 가능성을 탐험하세요.",
  keywords: ["조합 게임", "연금술", "퍼즐 게임", "Daily Workshop", "일일공방"],
  openGraph: {
    title: "일일공방 (Daily Workshop)",
    description: "창의적인 조합으로 새로운 원소를 발견하세요!",
    type: "website",
  },
};

// Google AdSense Client ID
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense 스크립트 */}
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
