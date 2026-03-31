import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boater Portal",
  description: "Boating services, maintenance, captains, and vessel operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
