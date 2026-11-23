// HOMEPAGE (Layout)
// Overall structure, styling, metadata, AppShell component

// IMPORTS
import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { getPreferences } from "@/lib/browser-preferences";
import { garageSettings } from "@/lib/garage-settings";
import "./globals.css";


// FONTS
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// METADATA
export const metadata: Metadata = {
  title: "Valor Garage",
  description: "Hobby fleet profiles, jobs, and wiring diagrams.",
};


// MAIN FUNCTION
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <PreferredShell>{children}</PreferredShell>
        </Suspense>
      </body>
    </html>
  );
}

async function PreferredShell({ children }: { children: ReactNode }) {
  const [{ theme, motion }, { gallery, jobs }] = await Promise.all([getPreferences(), garageSettings()]);
  return <AppShell theme={theme} motion={motion} gallery={gallery} jobs={jobs}>{children}</AppShell>;
}
