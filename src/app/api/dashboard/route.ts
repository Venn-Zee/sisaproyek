import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const [statsRes, monthlyRes, categoryRes, citiesRes] = await Promise.all([
    supabase.from('dashboard_stats').select('*').eq('id', 1).single(),
    supabase.from('monthly_carbon_data').select('*').order('id'),
    supabase.from('category_breakdown').select('*').order('id'),
    supabase.from('top_cities').select('*').order('saved', { ascending: false }),
  ]);

  if (statsRes.error) {
    console.error('[GET /api/dashboard] stats:', statsRes.error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }

  const s = statsRes.data;
  return NextResponse.json({
    stats: {
      totalWasteSaved:   Number(s.total_waste_saved),
      co2Reduced:        Number(s.co2_reduced),
      totalTransactions: s.total_transactions,
      umkmHelped:        s.umkm_helped,
      totalListings:     s.total_listings,
      activeCities:      s.active_cities,
    },
    monthlyCarbonData: (monthlyRes.data ?? []).map((r) => ({
      month:   r.month,
      ton:     Number(r.ton),
      savings: Number(r.savings),
    })),
    categoryBreakdown: (categoryRes.data ?? []).map((r) => ({
      name:  r.name,
      value: r.value,
      color: r.color,
    })),
    topCities: (citiesRes.data ?? []).map((r) => ({
      city:     r.city,
      listings: r.listings,
      saved:    Number(r.saved),
    })),
  });
}
