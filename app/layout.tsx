import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "block" });

export const metadata: Metadata = {
  title: "Wonder Land — Explore Sri Lanka",
  description:
    "An immersive 3D virtual tour of Sri Lanka. Explore Sigiriya, Galle Fort, Ella, Kandy and more through a cinematic interactive experience.",
  openGraph: {
    title: "Wonder Land — Explore Sri Lanka",
    description: "An immersive 3D virtual tour of Sri Lanka",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${bebas.variable}`}>
      <body className="h-full overflow-hidden bg-[#050a14]">{children}</body>
    </html>
  );
}
