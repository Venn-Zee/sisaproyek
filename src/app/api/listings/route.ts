import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
type DbListing = {
  id: string;
  title: string;
  category: string;
  weight: number;
  condition: string;
  status: string;
  price: number;
  price_unit: string;
  description: string;
  images: string[];
  seller_name: string;
  seller_type: string;
  seller_verified: boolean;
  seller_rating: number;
  seller_project_name: string;
  location_city: string;
  location_province: string;
  location_address: string;
  location_lat: number;
  location_lng: number;
  carbon_saved: number;
  posted_at: string;
  expires_at: string;
  views: number;
  inquiries: number;
};

// City → coordinates lookup (for auto geo-tagging from form)
const CITY_COORDS: Record<string, [number, number]> = {
  'Jakarta Pusat':    [-6.1864, 106.8340],
  'Jakarta Selatan':  [-6.2615, 106.8106],
  'Jakarta Utara':    [-6.1481, 106.8998],
  'Jakarta Barat':    [-6.1352, 106.7619],
  'Jakarta Timur':    [-6.2251, 106.9004],
  'Bekasi':           [-6.2349, 106.9923],
  'Depok':            [-6.4025, 106.7942],
  'Bogor':            [-6.5971, 106.8060],
  'Tangerang':        [-6.1784, 106.6319],
  'Cikarang':         [-6.3133, 107.1454],
  'Bandung':          [-6.9175, 107.6191],
  'Semarang':         [-6.9839, 110.4211],
  'Surabaya':         [-7.2575, 112.7521],
  'Yogyakarta':       [-7.7956, 110.3695],
  'Cilegon':          [-6.0083, 106.0283],
  'Medan':            [ 3.5952,  98.6722],
  'Makassar':         [-5.1477, 119.4327],
  'Palembang':        [-2.9761, 104.7754],
  'Majalengka':       [-6.8362, 108.2272],
  'Lainnya':          [-6.2088, 106.8456],
};

// CO₂ saved per ton by category
const CO2_PER_TON: Record<string, number> = {
  baja: 2.5, semen: 1.5, kayu: 2.0, keramik: 0.8,
  kaca: 1.2, bata: 0.7, pipa: 1.8, lainnya: 1.0,
};

// Transform DB row (snake_case) → API shape (camelCase / nested)
function toApiListing(row: DbListing) {
  return {
    id:          row.id,
    title:       row.title,
    category:    row.category,
    weight:      Number(row.weight),
    condition:   row.condition,
    status:      row.status,
    price:       Number(row.price),
    priceUnit:   row.price_unit,
    description: row.description,
    images:      row.images ?? [],
    seller: {
      name:        row.seller_name,
      type:        row.seller_type,
      verified:    row.seller_verified,
      rating:      Number(row.seller_rating),
      projectName: row.seller_project_name,
    },
    location: {
      city:     row.location_city,
      province: row.location_province,
      address:  row.location_address,
      lat:      Number(row.location_lat),
      lng:      Number(row.location_lng),
    },
    carbonSaved: Number(row.carbon_saved),
    postedAt:    row.posted_at,
    expiresAt:   row.expires_at,
    views:       row.views,
    inquiries:   row.inquiries,
  };
}

// ─── Recalculate & update dashboard_stats ─────────────────────────────────────
async function refreshDashboardStats(addedWeight: number, addedCarbon: number, city: string) {
  // Fetch current stats
  const { data: stats, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !stats) return;

  // Count distinct active cities from listings table
  const { data: cityRows } = await supabase
    .from('listings')
    .select('location_city');
  const activeCities = new Set(cityRows?.map((r) => r.location_city) ?? []).size;

  // Count total listings
  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  // Increment stats
  await supabase
    .from('dashboard_stats')
    .update({
      total_waste_saved:  parseFloat((Number(stats.total_waste_saved) + addedWeight).toFixed(2)),
      co2_reduced:        parseFloat((Number(stats.co2_reduced) + addedCarbon).toFixed(2)),
      total_listings:     totalListings ?? Number(stats.total_listings) + 1,
      active_cities:      activeCities,
      updated_at:         new Date().toISOString(),
    })
    .eq('id', 1);

  // Update category_breakdown — recalculate from listings
  const { data: allListings } = await supabase
    .from('listings')
    .select('category');

  if (allListings && allListings.length > 0) {
    const catCount: Record<string, number> = {};
    for (const r of allListings) {
      catCount[r.category] = (catCount[r.category] ?? 0) + 1;
    }
    const total = allListings.length;

    const CATEGORY_COLORS: Record<string, string> = {
      baja: '#6366f1', semen: '#94a3b8', kayu: '#10b981', keramik: '#f59e0b',
      kaca: '#06b6d4', bata: '#ef4444', pipa: '#8b5cf6', lainnya: '#64748b',
    };
    const CATEGORY_LABELS: Record<string, string> = {
      baja: 'Baja', semen: 'Semen', kayu: 'Kayu', keramik: 'Keramik',
      kaca: 'Kaca', bata: 'Bata', pipa: 'Pipa', lainnya: 'Lainnya',
    };

    // Delete and re-insert category breakdown
    await supabase.from('category_breakdown').delete().neq('id', 0);
    const rows = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({
        name:  CATEGORY_LABELS[cat] ?? cat,
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[cat] ?? '#64748b',
      }));
    await supabase.from('category_breakdown').insert(rows);
  }

  // Update top_cities — recalculate from listings
  const { data: cityData } = await supabase
    .from('listings')
    .select('location_city, carbon_saved');

  if (cityData && cityData.length > 0) {
    const cityMap: Record<string, { count: number; saved: number }> = {};
    for (const r of cityData) {
      const key = r.location_city;
      if (!cityMap[key]) cityMap[key] = { count: 0, saved: 0 };
      cityMap[key].count += 1;
      cityMap[key].saved  += Number(r.carbon_saved);
    }

    await supabase.from('top_cities').delete().neq('id', 0);
    const cityRows = Object.entries(cityMap)
      .sort((a, b) => b[1].saved - a[1].saved)
      .slice(0, 6)
      .map(([c, v]) => ({
        city:     c,
        listings: v.count,
        saved:    parseFloat(v.saved.toFixed(2)),
      }));
    await supabase.from('top_cities').insert(cityRows);
  }
}

// ─── GET /api/listings ────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const sp       = request.nextUrl.searchParams;
  const search   = sp.get('search')   ?? '';
  const category = sp.get('category') ?? '';
  const city     = sp.get('city')     ?? '';
  const maxPrice = parseInt(sp.get('maxPrice') ?? '0', 10);

  let query = supabase.from('listings').select('*');

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,location_city.ilike.%${search}%,seller_name.ilike.%${search}%`
    );
  }
  if (category) {
    const cats = category.split(',').filter(Boolean);
    if (cats.length === 1) query = query.eq('category', cats[0]);
    else if (cats.length > 1) query = query.in('category', cats);
  }
  if (city && city !== 'Semua Kota') {
    query = query.or(
      `location_city.ilike.%${city}%,location_province.ilike.%${city}%`
    );
  }
  if (maxPrice > 0 && maxPrice < 20_000_000) {
    query = query.or(`price.eq.0,price.lte.${maxPrice}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/listings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: (data as DbListing[]).map(toApiListing) });
}

// ─── POST /api/listings ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Required fields
  const required = ['title', 'category', 'weight', 'sellerName', 'sellerType', 'city'];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Field "${field}" wajib diisi` }, { status: 400 });
    }
  }

  const city     = String(body.city ?? 'Lainnya');
  const category = String(body.category ?? 'lainnya');
  const weight   = parseFloat(String(body.weight)) || 0;
  const [lat, lng] = CITY_COORDS[city] ?? CITY_COORDS['Lainnya'];
  const carbonSaved = parseFloat((weight * (CO2_PER_TON[category] ?? 1.0)).toFixed(2));

  const today    = new Date();
  const expires  = new Date(today);
  expires.setDate(expires.getDate() + 90);

  const newRow = {
    id:                  `SP-${Date.now()}`,
    title:               String(body.title),
    category,
    weight,
    condition:           String(body.condition ?? 'Baik'),
    status:              'Tersedia',
    price:               parseFloat(String(body.price ?? 0)) || 0,
    price_unit:          String(body.priceUnit ?? 'gratis'),
    description:         String(body.description ?? ''),
    images:              [],
    seller_name:         String(body.sellerName),
    seller_type:         String(body.sellerType),
    seller_verified:     false,
    seller_rating:       null,
    seller_project_name: String(body.projectName ?? ''),
    location_city:       city,
    location_province:   String(body.province ?? ''),
    location_address:    String(body.address ?? ''),
    location_lat:        lat,
    location_lng:        lng,
    carbon_saved:        carbonSaved,
    posted_at:           today.toISOString().split('T')[0],
    expires_at:          expires.toISOString().split('T')[0],
    views:               0,
    inquiries:           0,
  };

  const { data, error } = await supabase
    .from('listings')
    .insert([newRow])
    .select()
    .single();

  if (error) {
    console.error('[POST /api/listings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Recalculate & update all dashboard stats in the background
  await refreshDashboardStats(weight, carbonSaved, city);

  return NextResponse.json({ listing: toApiListing(data as DbListing) }, { status: 201 });
}
