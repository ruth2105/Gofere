import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Gofer Exam - Study Abroad Consultancy & Scholarship Discovery",
  description: "Your trusted partner for studying abroad. Discover scholarships, prepare for IELTS/TOEFL/Duolingo, get visa guidance, and university admission support.",
  keywords: "study abroad, scholarships, IELTS, TOEFL, Duolingo, university admission, visa guidance, educational consultancy, Ethiopia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
