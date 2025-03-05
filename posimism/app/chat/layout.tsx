// app/aichat/layout.tsx
import type { Metadata } from "next";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "Posismism — Posimist Bot",
  description: "Chat with Posimist Bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      {children}
    </Fragment>
  );
}