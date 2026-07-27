import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "BuildMonitor",
  description: "DevOps observability: deployments, health, and metrics in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg text-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
