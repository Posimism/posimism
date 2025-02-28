import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import QueryClientProviderProvider from "@/components/QueryClientProviderProvider";
import { LogInOutToggle } from "@/components/LogInOutToggle";
import Link from "next/link";
import { AuthDialogProvider } from "@/components/AuthenticatorModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  style: "normal",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Posismism",
  description: "Become a Posimist!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-tr from-purple-300 via-blue-200 to-green-300 min-h-screen`}
      >
        <ConfigureAmplifyClientSide />
        <AuthDialogProvider>
          <QueryClientProviderProvider>
            <nav className="flex justify-between items-center bg-gray-800 text-white p-2">
              <Link href={"/"} className="text-2xl font-pacifico">
                Posimism
              </Link>
              <LogInOutToggle />
            </nav>
            <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] overflow-hidden pt-4">
              {children}
            </div>
          </QueryClientProviderProvider>
        </AuthDialogProvider>
      </body>
    </html>
  );
}
