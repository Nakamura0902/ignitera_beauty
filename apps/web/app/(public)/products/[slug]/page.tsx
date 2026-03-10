import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import {
  formatPrice,
  formatVolume,
  formatSkinTypes,
  buildExternalUrl,
} from "@/lib/utils";
import type { ProductWithDetails, SkinType } from "@/types/database";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithBrand } from "@/types/database";

export const revalidate = 3600; // ISR: 1時間

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, meta_title, meta_description, brands(name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!product) return {};

  const brand = product.brands as unknown as { name: string } | null;
  const title = product.meta_title ?? `${product.name} | ${brand?.name ?? ""}`;
  const description =
    product.meta_description ??
    product.description?.slice(0, 160) ??
    `${brand?.name ?? ""} ${product.name} のスペック詳細`;

  return { title, description };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

const SPEC_LABELS: { key: string; label: string }[] = [
  { key: "spf", label: "SPF" },
  { key: "pa", label: "PA" },
  { key: "texture", label: "テクスチャー" },
  { key: "main_ingredients", label: "主な成分" },
  { key: "scent", label: "香り" },
  { key: "wash_type", label: "洗い流し" },
];

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, brands(*), categories(*)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const p = product as unknown as ProductWithDetails;

  // 関連商品（同カテゴリ）
  const { data: related } = await supabase
    .from("products")
    .select("*, brands(id, name, slug, logo_url)")
    .eq("category_id", p.category_id)
    .eq("is_published", true)
    .neq("id", p.id)
    .limit(4);

  const specs = p.specs_json as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* パンくず */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand">トップ</Link>
        <span>/</span>
        <Link href={`/categories/${p.categories.slug}`} className="hover:text-brand">
          {p.categories.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 line-clamp-1">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 左：画像 */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
            {p.main_image_url ? (
              <Image
                src={p.main_image_url}
                alt={p.name}
                fill
                priority
                className="object-contain p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* 右：詳細 */}
        <div>
          <Link href={`/brands/${p.brands.slug}`} className="text-sm text-brand hover:underline">
            {p.brands.name}
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">{p.name}</h1>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(p.price_yen)}
            </span>
            {p.volume_ml && (
              <span className="text-sm text-gray-500 mb-0.5">{formatVolume(p.volume_ml)}</span>
            )}
          </div>

          {/* 主要スペック */}
          <dl className="mt-6 space-y-3">
            <div className="flex gap-2 text-sm">
              <dt className="w-28 flex-shrink-0 text-gray-500">対象肌質</dt>
              <dd className="text-gray-800">
                {formatSkinTypes(p.skin_types as SkinType[])}
              </dd>
            </div>
            {p.is_fragrance_free && (
              <div className="flex gap-2 text-sm">
                <dt className="w-28 flex-shrink-0 text-gray-500">無香料</dt>
                <dd className="text-green-600 font-medium">○</dd>
              </div>
            )}
            {p.is_alcohol_free && (
              <div className="flex gap-2 text-sm">
                <dt className="w-28 flex-shrink-0 text-gray-500">ノンアルコール</dt>
                <dd className="text-green-600 font-medium">○</dd>
              </div>
            )}
            {SPEC_LABELS.map(({ key, label }) =>
              specs[key] != null ? (
                <div key={key} className="flex gap-2 text-sm">
                  <dt className="w-28 flex-shrink-0 text-gray-500">{label}</dt>
                  <dd className="text-gray-800">
                    {Array.isArray(specs[key])
                      ? (specs[key] as string[]).join(", ")
                      : String(specs[key])}
                  </dd>
                </div>
              ) : null
            )}
          </dl>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={buildExternalUrl(p.external_url, "product")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              公式サイトで購入する
              <ExternalLink size={15} />
            </a>
            <p className="text-center text-xs text-gray-400">
              購入は{p.brands.name}の公式サイトで行われます
            </p>
          </div>
        </div>
      </div>

      {/* 説明 */}
      {p.description && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="mb-3 text-base font-semibold text-gray-800">商品説明</h2>
          <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
            {p.description}
          </p>
        </div>
      )}

      {/* 関連商品 */}
      {related && related.length > 0 && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              同じカテゴリの商品
            </h2>
            <Link
              href={`/categories/${p.categories.slug}`}
              className="flex items-center gap-1 text-sm text-brand hover:underline"
            >
              もっと見る
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(related as ProductWithBrand[]).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
