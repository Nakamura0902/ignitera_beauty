import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
  const { data } = await supabase
    .from("brands")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((b: { slug: string }) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!brand) return {};

  return {
    title: `${brand.name} | メンズ美容品`,
    description:
      brand.description ??
      `${brand.name}のメンズ美容品一覧。スペック比較ができます。`,
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!brand) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, brands(id, name, slug, logo_url)")
    .eq("brand_id", brand.id)
    .eq("is_published", true)
    .order("display_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ブランドヘッダー */}
      <div className="mb-8 flex items-start gap-4">
        {brand.logo_url && (
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={brand.logo_url}
              alt={brand.name}
              fill
              className="object-contain p-2"
              sizes="64px"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
          {brand.description && (
            <p className="mt-1 text-sm text-gray-600">{brand.description}</p>
          )}
          {brand.website_url && (
            <a
              href={brand.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-brand hover:underline"
            >
              公式サイト <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500">{products?.length ?? 0}件の商品</p>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(products as ProductWithBrand[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">掲載商品がまだありません</p>
        </div>
      )}
    </div>
  );
}
