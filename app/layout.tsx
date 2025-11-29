import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CogniText - AI Workspace for Writers",
  description:
    "CogniText adalah workspace kolaboratif dan editor teks cerdas yang menggabungkan AI generatif dengan pengalaman seperti Google Docs dan IDE untuk penulis."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}