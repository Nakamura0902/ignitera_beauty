import Link from "next/link";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { createBrand } from "@/app/(admin)/actions";

export default async function AdminBrandsPage() {
  const supabase = await createAdminClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">ブランド管理</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 追加フォーム */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">ブランドを追加</h2>
          <form action={createBrand} className="card p-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ブランド名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: BULK HOMME"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">公式サイトURL</label>
              <input
                type="url"
                name="website_url"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://brand.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">請求先メール</label>
              <input
                type="email"
                name="billing_email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="billing@brand.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">説明</label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <Plus size={15} />
              追加
            </button>
          </form>
        </div>

        {/* ブランド一覧 */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">登録済みブランド</h2>
          <div className="card divide-y divide-gray-100">
            {brands?.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{brand.name}</p>
                  {brand.billing_email && (
                    <p className="text-xs text-gray-400">{brand.billing_email}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      brand.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {brand.is_active ? "掲載中" : "停止中"}
                  </span>
                </div>
              </div>
            ))}
            {(!brands || brands.length === 0) && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                ブランドがありません
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
