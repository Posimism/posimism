import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import QueryClientProviderProvider from "@/components/QueryClientProviderProvider";
import { Navbar } from "@/components/NavBar";
import { HomeIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

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
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-tr from-purple-300 via-blue-200 to-green-300`}
      >
        <Navbar
          companyName="Posimism"
          navItems={[
            {
              label: "Home",
              href: "/",
              active: true,
              icon: <HomeIcon className="mr-2 h-4 w-4" />,
            },
            {
              label: "Dashboard",
              href: "/dashboard",
              icon: <SettingsIcon className="mr-2 h-4 w-4" />,
            },
            { label: "Projects", href: "/projects" },
            { label: "Settings", href: "/settings" },
          ]}
          userItems={[
            {
              label: "Profile",
              icon: <UserIcon className="mr-2 h-4 w-4" />,
            },
            {
              label: "Settings",
              icon: <SettingsIcon className="mr-2 h-4 w-4" />,
            },
            {
              label: "Logout",
              icon: <LogOutIcon className="mr-2 h-4 w-4" />,
              variant: "destructive",
            },
          ]}
        />
        <QueryClientProviderProvider>
          <ConfigureAmplifyClientSide />
          <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-2 overflow-hidden pt-4">
            {children}
          </div>
        </QueryClientProviderProvider>
      </body>
    </html>
  );
}
