import Link from "next/link";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const supabase = await createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_yen, is_published, is_featured, brands(name), categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">商品管理</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-1.5">
          <Plus size={16} />
          商品を追加
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">商品名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">スラッグ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ブランド</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">カテゴリ</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">価格</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">公開</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">注目</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((product) => {
              const brand = product.brands as unknown as { name: string } | null;
              const category = product.categories as unknown as { name: string } | null;
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{product.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{brand?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatPrice(product.price_yen)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={product.is_published ? "text-green-600" : "text-gray-300"}>
                      {product.is_published ? "○" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={product.is_featured ? "text-amber-500" : "text-gray-300"}>
                      {product.is_featured ? "★" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs text-brand hover:underline"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <div className="py-12 text-center text-sm text-gray-400">
            商品がありません。「商品を追加」から登録してください。
          </div>
        )}
      </div>
    </div>
  );
}
