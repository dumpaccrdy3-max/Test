import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShortTree - Shortlink & Link-in-bio",
  description: "Web app untuk shortlink seperti Bitly dan listlink seperti Linktree."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}