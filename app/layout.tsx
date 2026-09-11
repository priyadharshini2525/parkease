import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParkEase",
  description: "Smart parking made simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-[#f3ede3] text-[#33271f]">

        <nav className="border-b border-[#cdbda8] bg-[#f3ede3]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

            <Link
              href="/"
              className="text-2xl font-bold text-[#3f2b20]"
            >
              Park<span className="text-[#285943]">Ease</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-[#5a4636] hover:text-[#285943] font-medium transition"
              >
                Home
              </Link>

              <Link
                href="/history"
                className="text-[#5a4636] hover:text-[#285943] font-medium transition"
              >
                History
              </Link>

              <Link
                href="/admin/login"
                className="text-[#5a4636] hover:text-[#285943] font-medium transition"
              >
                Admin
              </Link>
            </div>

          </div>
        </nav>

        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}