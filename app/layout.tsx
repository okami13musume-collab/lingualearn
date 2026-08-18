import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaLearn - AI Language Learning",
  description: "Generate personalized language lessons from your own content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
