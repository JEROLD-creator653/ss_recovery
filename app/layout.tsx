import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const Analytics = dynamic(() => import("./components/Analytics"), { ssr: false });
const SecurityShield = dynamic(() => import("./components/SecurityShield"), { ssr: false });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C5CFC",
};

export const metadata: Metadata = {
  title: "SAIL Slayer",
  description: "Automatic SAIL Slayer — bypass SAIL tests with one click. Built for students pushed beyond tolerance.",
  keywords: ["SAIL", "SAIL Slayer", "Edwisely", "test solver", "automatic answers"],
  authors: [{ name: "Jerry" }, { name: "N71.h5" }],
  robots: "index, follow",
  openGraph: {
    title: "SAIL Slayer",
    description: "Automatic SAIL Slayer — bypass SAIL tests with one click.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "google-adsense-account": "ca-pub-9564119438996773",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
        {children}
        <SecurityShield />
        <Analytics />
      </body>
    </html>
  );
}
