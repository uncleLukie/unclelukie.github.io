//app/layout.tsx (Should be fine)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "uncleLukie Portfolio",
    description: "3D Portfolio website for uncleLukie built with Next.js and react-three-fiber",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
    return (
        // Ensure html has lang if desired
        <html lang="en">
        {/* Apply font variables and base font class to body */}
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        </body>
        </html>
    );
}