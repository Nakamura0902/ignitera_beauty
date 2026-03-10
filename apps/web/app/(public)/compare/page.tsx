import type { Metadata } from "next";
import Link from "next/link";
import { GitCompare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CompareTable } from "@/components/compare/CompareTable";
import type { ProductWithDetails } from "@/types/database";

export const metadata: Metadata = {
  title: "商品比較",
  description: "メンズ美容品を横並びでスペック比較。",
  robots: { index: false }, // 動的ページなのでnoindex
};

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean).slice(0, 4) : [];

  let products: ProductWithDetails[] = [];

  if (idList.length >= 1) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, brands(*), categories(*)")
      .in("id", idList)
      .eq("is_published", true);

    if (data) {
      // URLの順序を維持
      products = idList
        .map((id) => data.find((p) => p.id === id))
        .filter(Boolean) as ProductWithDetails[];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <GitCompare size={22} className="text-brand" />
        <h1 className="text-xl font-bold text-gray-900">商品比較</h1>
      </div>

      {products.length >= 2 ? (
        <>
          <p className="mb-6 text-sm text-gray-500">
            {products.length}件の商品を比較中。「公式サイトへ」から各ブランドのページで購入できます。
          </p>
          <div className="card overflow-hidden">
            <CompareTable products={products} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <GitCompare size={40} className="text-gray-300" />
          <div>
            <p className="font-medium text-gray-600">
              {products.length === 1
                ? "もう1件以上の商品を選択してください"
                : "比較する商品を選択してください"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              商品詳細ページの「＋」ボタンで最大4件まで追加できます
            </p>
          </div>
          <Link href="/products" className="btn-primary">
            商品を探す
          </Link>
        </div>
      )}
    </div>
  );
}
