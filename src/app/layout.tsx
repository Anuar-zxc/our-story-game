import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin", "cyrillic"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Black Snow",
  description: "A dark branching visual novel about a winter settlement, a forest, and choices that remember you.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Black Snow",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${caveat.variable} font-sans antialiased text-stone-800 bg-paper-texture`}>
        {children}
      </body>
    </html>
  );
}
