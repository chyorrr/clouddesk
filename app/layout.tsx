import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudDesk — Your computer. In the cloud.",
  description: "A personal virtual desktop where your files live in the cloud. Sign in to access your computer from anywhere.",
  keywords: ["cloud storage", "virtual desktop", "file manager", "cloud computer"],
  openGraph: {
    title: "CloudDesk",
    description: "Your computer. In the cloud.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#008080" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
