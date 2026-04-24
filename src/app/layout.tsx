import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SisaProyek — B2B Marketplace Limbah Konstruksi Indonesia",
  description:
    "Platform geo-spatial B2B yang menghubungkan kontraktor besar dengan UMKM, arsitek, dan kampus untuk mendaur ulang sisa material konstruksi. Kurangi limbah, hemat biaya, capai target ESG.",
  keywords:
    "limbah konstruksi, sisa material, circular economy, B2B marketplace, baja bekas, keramik sisa, daur ulang bangunan",
  openGraph: {
    title: "SisaProyek — Circular Economy untuk Konstruksi Indonesia",
    description:
      "Selamatkan ratusan ton material konstruksi dari TPA. Hubungkan kontraktor besar dengan UMKM lokal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
