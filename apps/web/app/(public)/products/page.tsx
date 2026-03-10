import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithBrand, SkinType } from "@/types/database";
import { SKIN_TYPE_LABELS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "商品一覧",
  description: "メンズ美容品をスペックで絞り込んで比較。肌タイプ・価格帯・カテゴリで検索できます。",
};

interface Props {
  searchParams: Promise<{
    category?: string;
    skin?: string;
    max_price?: string;
    q?: string;
    featured?: string;
  }>;
}

const SKIN_TYPES: SkinType[] = ["oily", "dry", "combination", "sensitive", "all"];

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, brands(id, name, slug, logo_url)")
    .eq("is_published", true)
    .order("display_order")
    .order("created_at", { ascending: false });

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.skin) {
    query = query.contains("skin_types", [params.skin as SkinType]);
  }

  if (params.max_price) {
    query = query.lte("price_yen", parseInt(params.max_price));
  }

  if (params.featured === "true") {
    query = query.eq("is_featured", true);
  }

  if (params.q) {
    // ブランド名でも検索
    const { data: matchedBrands } = await supabase
      .from("brands")
      .select("id")
      .ilike("name", `%${params.q}%`);
    const brandIds = (matchedBrands ?? []).map((b: { id: string }) => b.id);

    if (brandIds.length > 0) {
      query = query.or(
        `name.ilike.%${params.q}%,brand_id.in.(${brandIds.join(",")})`
      );
    } else {
      query = query.ilike("name", `%${params.q}%`);
    }
  }

  const { data: products } = await query.limit(60);

  // カテゴリ一覧（フィルタ用）
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .is("parent_id", null)
    .order("display_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">商品一覧</h1>

      {/* 検索ボックス */}
      <form method="get" className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="商品名・ブランド名で検索"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            検索
          </button>
          {params.q && (
            <a
              href="/products"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              クリア
            </a>
          )}
        </div>
      </form>

      <div className="flex gap-8">
        {/* サイドバー：フィルタ */}
        <aside className="hidden w-52 flex-shrink-0 lg:block">
          <div className="space-y-6">
            {/* カテゴリ */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">カテゴリ</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/products"
                    className={`block rounded px-2 py-1 text-sm ${
                      !params.category ? "bg-brand text-white" : "text-gray-600 hover:text-brand"
                    }`}
                  >
                    すべて
                  </a>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/products?category=${cat.slug}`}
                      className={`block rounded px-2 py-1 text-sm ${
                        params.category === cat.slug
                          ? "bg-brand text-white"
                          : "text-gray-600 hover:text-brand"
                      }`}
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 肌タイプ */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">肌タイプ</h3>
              <ul className="space-y-1">
                {SKIN_TYPES.map((type) => (
                  <li key={type}>
                    <a
                      href={`/products?${new URLSearchParams({ ...params, skin: type }).toString()}`}
                      className={`block rounded px-2 py-1 text-sm ${
                        params.skin === type
                          ? "bg-brand text-white"
                          : "text-gray-600 hover:text-brand"
                      }`}
                    >
                      {SKIN_TYPE_LABELS[type]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 価格帯 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">価格帯</h3>
              <ul className="space-y-1 text-sm">
                {[
                  { label: "〜¥2,000", value: "2000" },
                  { label: "〜¥5,000", value: "5000" },
                  { label: "〜¥10,000", value: "10000" },
                ].map((price) => (
                  <li key={price.value}>
                    <a
                      href={`/products?${new URLSearchParams({ ...params, max_price: price.value }).toString()}`}
                      className={`block rounded px-2 py-1 ${
                        params.max_price === price.value
                          ? "bg-brand text-white"
                          : "text-gray-600 hover:text-brand"
                      }`}
                    >
                      {price.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* メイン：商品グリッド */}
        <div className="flex-1">
          {products && products.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-gray-500">{products.length}件</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Suspense>
                  {(products as ProductWithBrand[]).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </Suspense>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400">
              <p>商品が見つかりませんでした</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
