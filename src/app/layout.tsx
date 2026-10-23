import type { Metadata } from "next";
import { DotGothic16 } from "next/font/google";
import "./globals.css";

const pixelFont = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "すれ違い広場",
  description: "位置情報で近くのユーザーとすれ違うレトロWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${pixelFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
