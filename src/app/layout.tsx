import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smartyt - AI YouTube Creator Platform",
  description: "Turn a good idea into a video people choose to watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
