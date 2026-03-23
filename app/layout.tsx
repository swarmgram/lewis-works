import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  title: "Lewis — The personality model that remembers",
  description:
    "Lewis 1.5 beats Claude Opus on 3/6 personality axes at 1/125th the cost. Persistent memory architecture with $0 scaling. Enterprise API for market research, game AI, and simulation.",
  openGraph: {
    title: "Lewis — The personality model that remembers",
    description:
      "Lewis 1.5 beats frontier models on personality divergence, human likeness, and character persistence. $0 memory cost at any scale.",
    url: "https://lewis.works",
    siteName: "Lewis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lewis — The personality model that remembers",
    description:
      "Lewis 1.5 beats frontier models on personality divergence, human likeness, and character persistence. $0 memory cost at any scale.",
  },
  metadataBase: new URL("https://lewis.works"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
