import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/providers/auth-guard";
import { QueryProvider } from "@/components/providers/query-provider";
import { FirebaseSync } from "@/components/providers/firebase-sync";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tally — Lists, sections, instant totals.",
  description:
    "Tally is a fast, mobile-first price calculator for organizing items into sections with instant totals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <FirebaseSync>
            <AuthGuard>{children}</AuthGuard>
          </FirebaseSync>
        </QueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
