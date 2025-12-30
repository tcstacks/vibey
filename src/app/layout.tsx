import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Validation Stack",
  description: "Personal validation stack for rapid idea-to-customer testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
