import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithBrand } from "@/types/database";

type Banner = { id: string; title: string | null; image_url: string; link_url: string | null };

export default async function TopPage() {
  const supabase = await createClient();

  const [
    { data: banners },
    { data: featured },
    { data: latest },
  ] = await Promise.all([
    supabase
      .from("banners")
      .select("id, title, image_url, link_url")
      .eq("is_active", true)
      .order("display_order")
      .limit(6),
    supabase
      .from("products")
      .select("*, brands(id, name, slug, logo_url)")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("display_order")
      .limit(8),
    supabase
      .from("products")
      .select("*, brands(id, name, slug, logo_url)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div>
      {/* ヒーロー */}
      <section className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            メンズ美容品を
            <br />
            スペックで選ぼう
          </h1>
          <p className="mt-4 text-brand-100 text-base sm:text-lg">
            各ブランドの商品を横断的に比較。
            <br className="sm:hidden" />
            成分・価格・肌タイプで絞り込んで、最適な一品を見つける。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-brand hover:bg-accent-light transition-colors"
            >
              商品を探す
            </Link>
            <Link
              href="/compare"
              className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              商品を比較する
            </Link>
          </div>
        </div>
      </section>

      {/* バナーエリア */}
      {banners && banners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className={`grid gap-4 ${(banners as Banner[]).length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
            {(banners as Banner[]).map((banner) => {
              const inner = (
                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/1] sm:aspect-[2/1]">
                  <Image
                    src={banner.image_url}
                    alt={banner.title ?? "バナー"}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  {banner.title && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-4">
                      <span className="text-sm font-semibold text-white">{banner.title}</span>
                    </div>
                  )}
                </div>
              );
              return banner.link_url ? (
                <a key={banner.id} href={banner.link_url} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={banner.id}>{inner}</div>
              );
            })}
          </div>
        </section>
      )}

      {/* 注目商品 */}
      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">注目の商品</h2>
            <Link href="/products?featured=true" className="flex items-center gap-1 text-sm text-brand hover:underline">
              もっと見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(featured as ProductWithBrand[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 新着商品 */}
      {latest && latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">新着商品</h2>
            <Link href="/products" className="flex items-center gap-1 text-sm text-brand hover:underline">
              すべて見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(latest as ProductWithBrand[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA：掲載のご相談 */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900">ブランドの方へ</h2>
          <p className="mt-3 text-sm text-gray-600">
            IGNITERA BEAUTYへの商品掲載は月額¥2,500/商品から。
            <br />
            詳しくはお気軽にお問い合わせください。
          </p>
          <a
            href="mailto:contact@ignitera.jp"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            掲載のご相談
          </a>
        </div>
      </section>
    </div>
  );
}
