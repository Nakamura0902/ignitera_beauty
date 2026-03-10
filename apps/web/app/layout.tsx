import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "Yutori | メンズ美容品 比較・発見",
    template: "%s | Yutori",
  },
  description:
    "メンズ美容品を横断的に比較できるプラットフォーム。洗顔・化粧水・日焼け止めなど、スペックで選ぶ新しい美容体験。",
  openGraph: {
    siteName: "Yutori",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
