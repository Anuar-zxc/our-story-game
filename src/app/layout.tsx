import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin", "cyrillic"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Our Story: Pixel Hearts",
  description: "A branching pixel-art relationship visual novel for mobile",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Pixel Hearts",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} font-sans antialiased text-stone-800 bg-paper-texture`}>
        {children}
      </body>
    </html>
  );
}
