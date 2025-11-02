import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Link Shortening Service",
  description: "Create and manage shortened links",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
