"use client";

// IMPORTS
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            My App
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} My App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}