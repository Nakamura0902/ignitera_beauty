import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createAdminClient();

  const [
    { count: productCount },
    { count: brandCount },
    { data: billing },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("brands").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("monthly_billing").select("*"),
  ]);

  const totalMonthlyFee = billing?.reduce((sum, b) => sum + (b.monthly_fee_yen ?? 0), 0) ?? 0;
  const activeListingsCount = billing?.reduce((sum, b) => sum + (b.active_product_count ?? 0), 0) ?? 0;

  const stats = [
    { label: "掲載商品数", value: productCount?.toLocaleString() ?? "—" },
    { label: "掲載ブランド数", value: brandCount?.toLocaleString() ?? "—" },
    { label: "有効掲載数", value: activeListingsCount.toLocaleString() },
    { label: "当月予想収益", value: formatPrice(totalMonthlyFee) },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">ダッシュボード</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 月次請求サマリー */}
      {billing && billing.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-gray-800">当月請求サマリー</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">ブランド</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">掲載商品数</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">月額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {billing.map((b) => (
                  <tr key={b.brand_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{b.brand_name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{b.active_product_count}件</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPrice(b.monthly_fee_yen)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700" colSpan={2}>合計</td>
                  <td className="px-4 py-3 text-right font-bold text-brand">
                    {formatPrice(totalMonthlyFee)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
