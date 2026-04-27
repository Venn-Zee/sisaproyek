import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const MARKET_PRICES: Record<string, number> = {
  baja:     12_000_000,  // Rp/ton
  semen:     1_800_000,
  kayu:      4_500_000,
  keramik:     350_000,  // Rp/m²
  kaca:        280_000,
  bata:        900_000,
  pipa:      3_200_000,
  lainnya:   2_000_000,
};

const CATEGORY_LABELS: Record<string, string> = {
  baja: "baja/besi konstruksi", semen: "semen", kayu: "kayu bangunan",
  keramik: "keramik/granit", kaca: "kaca", bata: "bata merah/bata ringan",
  pipa: "pipa PVC/besi", lainnya: "material bangunan lainnya",
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({ error: "GEMINI_API_KEY belum dikonfigurasi." }, { status: 500 });
    }

    const formData = await req.formData();
    const file    = formData.get("image") as File | null;
    const category = (formData.get("category") as string) ?? "lainnya";
    const weight   = parseFloat((formData.get("weight") as string) ?? "0");

    if (!file) {
      return NextResponse.json({ error: "Gambar tidak ditemukan." }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const marketPrice = MARKET_PRICES[category] ?? MARKET_PRICES.lainnya;
    const categoryLabel = CATEGORY_LABELS[category] ?? "material bangunan";
    const weightInfo = weight > 0 ? ` seberat ${weight} ton` : "";

    const prompt = `Kamu adalah ahli konstruksi dan penilai material bangunan bekas berpengalaman di Indonesia.

Analisis gambar ${categoryLabel}${weightInfo} ini yang akan dijual sebagai sisa material proyek konstruksi.

Berikan evaluasi dalam format JSON dengan struktur PERSIS seperti berikut (tanpa markdown, hanya JSON murni):

{
  "kondisi": "Sangat Baik" | "Baik" | "Cukup" | "Kurang Baik",
  "skor": <angka 1-10>,
  "ringkasan": "<1-2 kalimat ringkasan kondisi dalam Bahasa Indonesia>",
  "detail": [
    "<poin observasi 1>",
    "<poin observasi 2>",
    "<poin observasi 3>"
  ],
  "persentase_diskon": <angka 10-70>,
  "rekomendasi_harga_per_unit": <harga dalam rupiah per unit/ton/m2>,
  "satuan": "per ton" | "per m²" | "per unit",
  "alasan_harga": "<penjelasan singkat mengapa harga ini wajar>",
  "tips_penjualan": "<1 tips singkat untuk mempercepat penjualan>"
}

Acuan harga pasar baru ${categoryLabel}: Rp ${marketPrice.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / unit.

Panduan diskon berdasarkan kondisi:
- Sangat Baik (skor 8-10): diskon 15-25% dari harga baru
- Baik (skor 6-7): diskon 30-40% dari harga baru
- Cukup (skor 4-5): diskon 45-55% dari harga baru
- Kurang Baik (skor 1-3): diskon 60-70% dari harga baru

Pastikan harga rekomendasi tetap menguntungkan penjual namun kompetitif di pasar material bekas Indonesia.
Jawab HANYA dengan JSON, tanpa penjelasan lain.`;

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      prompt,
    ]);

    const rawText = result.response.text().trim();

    // Extract JSON from response (strip any markdown fences if present)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Format respons AI tidak valid." }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Calculate total price if weight provided
    const totalPrice = weight > 0
      ? Math.round(analysis.rekomendasi_harga_per_unit * weight)
      : null;

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        total_harga: totalPrice,
        harga_pasar_acuan: marketPrice,
        kategori: category,
      },
    });
  } catch (err) {
    console.error("[analyze-material]", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
