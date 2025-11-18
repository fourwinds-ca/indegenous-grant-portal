import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Buffalo Indigenous Grant Portal",
  description: "Simplify your path to Indigenous funding. Discover, track, and manage grant opportunities for Indigenous communities across Canada.",
  keywords: ["Indigenous grants", "Indigenous funding", "Canadian grants", "First Nations", "Inuit", "Métis"],
  icons: {
    icon: '/greenbuffalo_logo.png',
    shortcut: '/greenbuffalo_logo.png',
    apple: '/greenbuffalo_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
