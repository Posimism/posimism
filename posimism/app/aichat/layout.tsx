import type { Metadata } from "next";
// import ConfigureAmplifyClientSide from "../../components/ConfigureAmplify";
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
      {/* <ConfigureAmplifyClientSide /> */}
      {children}
    </Fragment>
  );
}