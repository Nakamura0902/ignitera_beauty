import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithBrand } from "@/types/database";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  if (!supabase) return [];
  const { data } = await supabase.from("categories").select("slug");
  return (data ?? []).map((c: { slug: string }) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!cat) return {};

  return {
    title: `メンズ${cat.name} おすすめ比較`,
    description:
      cat.description ??
      `メンズ${cat.name}のおすすめ商品を比較。成分・価格・肌タイプで選べます。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, brands(id, name, slug, logo_url)")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("display_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          メンズ{category.name} おすすめ比較
        </h1>
        {category.description && (
          <p className="mt-2 text-sm text-gray-600">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">{products?.length ?? 0}件</p>
      </div>

      {/* 商品グリッド */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(products as ProductWithBrand[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">このカテゴリの商品はまだありません</p>
        </div>
      )}
    </div>
  );
}
