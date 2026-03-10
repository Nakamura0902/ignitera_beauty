import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { addListing } from "@/app/(admin)/actions";

export default async function AdminListingsPage() {
  const supabase = await createAdminClient();

  const [{ data: billing }, { data: products }, { data: brands }] = await Promise.all([
    supabase.from("monthly_billing").select("*").order("monthly_fee_yen", { ascending: false }),
    supabase.from("products").select("id, name, brands(name)").eq("is_published", true).order("name"),
    supabase.from("brands").select("id, name").eq("is_active", true).order("name"),
  ]);

  const totalFee = billing?.reduce((s, b) => s + (b.monthly_fee_yen ?? 0), 0) ?? 0;

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">掲載料管理</h1>
      <p className="mb-6 text-sm text-gray-500">商品1件あたり ¥2,500/月</p>

      {/* 月次サマリー */}
      <div className="mb-6 card p-5">
        <p className="text-xs text-gray-500">当月予想収益</p>
        <p className="mt-1 text-3xl font-bold text-brand">{formatPrice(totalFee)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 掲載登録フォーム */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">掲載を追加</h2>
          <form action={addListing} className="card p-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ブランド <span className="text-red-500">*</span>
              </label>
              <select name="brand_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">選択</option>
                {brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                商品 <span className="text-red-500">*</span>
              </label>
              <select name="product_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">選択</option>
                {products?.map((p) => {
                  const brand = p.brands as unknown as { name: string } | null;
                  return <option key={p.id} value={p.id}>{brand?.name} - {p.name}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                掲載開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="period_start"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">掲載料: ¥2,500/月（固定）</p>
            <button type="submit" className="btn-primary">掲載を追加</button>
          </form>
        </div>

        {/* ブランド別サマリー */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">ブランド別掲載状況</h2>
          <div className="card divide-y divide-gray-100">
            {billing?.map((b) => (
              <div key={b.brand_id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.brand_name}</p>
                  <p className="text-xs text-gray-400">{b.active_product_count}件掲載</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatPrice(b.monthly_fee_yen)}/月</p>
              </div>
            ))}
            {(!billing || billing.length === 0) && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">掲載なし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
