// app/aichat/layout.tsx
import type { Metadata } from "next";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "Posismism",
  description: "Test Whether Authenticated",
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