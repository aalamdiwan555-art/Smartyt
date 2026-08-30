import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smartyt - AI YouTube Creator Platform",
  description: "Create smarter. Optimize better. Grow faster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="transition-all duration-300" style={{ marginLeft: "16rem" }}>
              <Header />
              <main className="pt-16 p-6 max-w-7xl mx-auto">
                {children}
              </main>
            </div>
            <Toaster position="top-right" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
