import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Rocky & Swarupa | The Union",
  description: "Join us as we celebrate the union of Rocky Karmakar and Swarupa Sarkar. November 25-27, 2026, West Bengal.",
  keywords: ["wedding", "Rocky", "Swarupa", "wedding invitation", "West Bengal"],
  authors: [{ name: "Rocky & Swarupa" }],
  openGraph: {
    title: "Rocky & Swarupa | The Union",
    description: "Join us as we celebrate our wedding",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
