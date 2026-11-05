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
  description: "Educational information and consultancy support for studying abroad, scholarships, and English exam preparation.",
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
        className={`${inter.variable} font-sans antialiased bg-brand-light`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
