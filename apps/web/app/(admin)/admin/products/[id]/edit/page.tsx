import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/(admin)/actions";
import type { SkinType } from "@/types/database";
import { SKIN_TYPE_LABELS } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

// This is a server component — we need async
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const [
    { data: product },
    { data: brands },
    { data: categories },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("brands").select("id, name").eq("is_active", true).order("name"),
    supabase.from("categories").select("id, name").order("display_order"),
  ]);

  if (!product) notFound();

  const p = product as unknown as {
    id: string; brand_id: string; category_id: string | null;
    name: string; slug: string; description: string | null;
    price_yen: number | null; volume_ml: number | null;
    skin_types: string[]; is_fragrance_free: boolean; is_alcohol_free: boolean;
    specs_json: Record<string, unknown> | null; external_url: string | null;
    is_published: boolean; is_featured: boolean;
    main_image_url: string | null;
    meta_title: string | null; meta_description: string | null;
  };

  const specs = (p.specs_json ?? {}) as Record<string, unknown>;
  const SKIN_TYPES: SkinType[] = ["oily", "dry", "combination", "sensitive", "all"];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">商品を編集</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/products/${p.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            商品ページを確認
            <ExternalLink size={13} />
          </Link>
          <Link href="/admin/products" className="btn-outline text-sm">
            一覧に戻る
          </Link>
        </div>
      </div>

      <form action={updateProduct} className="space-y-6">
        <input type="hidden" name="id" value={p.id} />

        {/* ─── 基本情報 ─── */}
        <section className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">基本情報</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ブランド <span className="text-red-500">*</span>
              </label>
              <select
                name="brand_id"
                required
                defaultValue={p.brand_id}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {(brands as unknown as { id: string; name: string }[] | null)?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">カテゴリ</label>
              <select
                name="category_id"
                defaultValue={p.category_id ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">未設定</option>
                {(categories as unknown as { id: string; name: string }[] | null)?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              商品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={p.name}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              スラッグ（URL）
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 whitespace-nowrap">/products/</span>
              <input
                type="text"
                name="slug"
                defaultValue={p.slug}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                placeholder="product-slug"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">変更すると既存のURLが変わります。空欄の場合は商品名から自動生成。</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">商品説明</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={p.description ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="商品の特徴、使い方など"
            />
          </div>
        </section>

        {/* ─── 価格・容量 ─── */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">価格・容量</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">価格（円）</label>
              <input
                type="number"
                name="price_yen"
                min="0"
                defaultValue={p.price_yen ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="3300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">容量（ml）</label>
              <input
                type="number"
                name="volume_ml"
                min="0"
                step="0.1"
                defaultValue={p.volume_ml ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="150"
              />
            </div>
          </div>
        </section>

        {/* ─── 肌タイプ・成分 ─── */}
        <section className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">肌タイプ・成分</h2>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">対象肌質</label>
            <div className="flex flex-wrap gap-4">
              {SKIN_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="skin_types"
                    value={type}
                    defaultChecked={p.skin_types.includes(type)}
                    className="rounded"
                  />
                  {SKIN_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_fragrance_free"
                defaultChecked={p.is_fragrance_free}
                className="rounded"
              />
              無香料
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_alcohol_free"
                defaultChecked={p.is_alcohol_free}
                className="rounded"
              />
              ノンアルコール
            </label>
          </div>
        </section>

        {/* ─── スペック ─── */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">スペック詳細</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SPF</label>
              <input
                type="text"
                name="spec_spf"
                defaultValue={(specs.spf as string) ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: SPF50+"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">PA</label>
              <input
                type="text"
                name="spec_pa"
                defaultValue={(specs.pa as string) ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: PA++++"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">テクスチャー</label>
              <input
                type="text"
                name="spec_texture"
                defaultValue={(specs.texture as string) ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: ジェル、ミルク、クリーム"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">香り</label>
              <input
                type="text"
                name="spec_scent"
                defaultValue={(specs.scent as string) ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: 無香料、フローラル"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">洗い流し</label>
              <input
                type="text"
                name="spec_wash_type"
                defaultValue={(specs.wash_type as string) ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: 洗い流し不要、洗顔で落とせる"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">主な成分</label>
            <input
              type="text"
              name="spec_main_ingredients"
              defaultValue={
                Array.isArray(specs.main_ingredients)
                  ? (specs.main_ingredients as string[]).join(", ")
                  : (specs.main_ingredients as string) ?? ""
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="例: ヒアルロン酸, ナイアシンアミド, セラミド（カンマ区切り）"
            />
          </div>
        </section>

        {/* ─── 商品画像 ─── */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">商品画像</h2>
          {p.main_image_url && (
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0">
                <Image
                  src={p.main_image_url}
                  alt="現在の商品画像"
                  fill
                  className="object-contain p-1"
                  sizes="96px"
                />
              </div>
              <p className="text-xs text-gray-500">現在の画像。新しい画像を選択すると置き換わります。</p>
            </div>
          )}
          <input
            type="file"
            name="main_image"
            accept="image/*"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:text-gray-700"
          />
          <p className="text-xs text-gray-400">JPG・PNG・WebP（推奨: 正方形、1000px以上）</p>
        </section>

        {/* ─── 公式URL ─── */}
        <section className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">公式サイトURL</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              公式商品ページURL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="external_url"
              required
              defaultValue={p.external_url ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="https://brand.com/products/xxx"
            />
            <p className="mt-1 text-xs text-gray-400">「公式サイトで購入する」ボタンのリンク先です。</p>
          </div>
        </section>

        {/* ─── SEO ─── */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">SEO設定（任意）</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">メタタイトル</label>
            <input
              type="text"
              name="meta_title"
              defaultValue={p.meta_title ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="未入力の場合は「商品名 | ブランド名」が使われます"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">メタディスクリプション</label>
            <textarea
              name="meta_description"
              rows={2}
              defaultValue={p.meta_description ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="未入力の場合は商品説明の冒頭160文字が使われます"
            />
          </div>
        </section>

        {/* ─── 公開設定 ─── */}
        <section className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-4">公開設定</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={p.is_published}
                className="rounded"
              />
              <span>公開する</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={p.is_featured}
                className="rounded"
              />
              <span>注目商品にする（トップページに表示）</span>
            </label>
          </div>
        </section>

        <div className="flex gap-3 pb-8">
          <button type="submit" className="btn-primary">
            保存する
          </button>
          <Link href="/admin/products" className="btn-outline">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
