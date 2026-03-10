import { notFound } from "next/navigation";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/(admin)/actions";
import type { SkinType } from "@/types/database";
import { SKIN_TYPE_LABELS } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

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
    id: string; brand_id: string; category_id: string;
    name: string; description: string | null;
    price_yen: number | null; volume_ml: number | null;
    skin_types: string[]; is_fragrance_free: boolean; is_alcohol_free: boolean;
    specs_json: Record<string, unknown>; external_url: string;
    is_published: boolean; is_featured: boolean;
    main_image_url: string | null;
  };

  const SKIN_TYPES: SkinType[] = ["oily", "dry", "combination", "sensitive", "all"];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">商品を編集</h1>

      <form action={updateProduct} className="card max-w-2xl p-6 space-y-5">
        <input type="hidden" name="id" value={p.id} />

        {/* ブランド */}
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

        {/* カテゴリ */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select
            name="category_id"
            required
            defaultValue={p.category_id}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {(categories as unknown as { id: string; name: string }[] | null)?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* 商品名 */}
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

        {/* 説明 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">商品説明</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={p.description ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* 価格・容量 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">価格（円）</label>
            <input
              type="number"
              name="price_yen"
              min="0"
              defaultValue={p.price_yen ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">容量（ml）</label>
            <input
              type="number"
              name="volume_ml"
              min="0"
              defaultValue={p.volume_ml ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* 肌タイプ */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">対象肌質</label>
          <div className="flex flex-wrap gap-3">
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

        {/* フラグ */}
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

        {/* 追加スペック */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            追加スペック（JSON形式）
          </label>
          <textarea
            name="specs_json"
            rows={3}
            defaultValue={JSON.stringify(p.specs_json, null, 2)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
          />
        </div>

        {/* 商品画像 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">商品画像</label>
          {p.main_image_url && (
            <div className="mb-3 flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <Image
                  src={p.main_image_url}
                  alt="現在の商品画像"
                  fill
                  className="object-contain p-1"
                  sizes="80px"
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
          <p className="mt-1 text-xs text-gray-400">JPG・PNG・WebP（推奨: 正方形、1000px以上）</p>
        </div>

        {/* 外部URL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            公式商品ページURL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            name="external_url"
            required
            defaultValue={p.external_url}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* 公開設定 */}
        <div className="flex gap-6 border-t border-gray-100 pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={p.is_published}
              className="rounded"
            />
            公開する
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={p.is_featured}
              className="rounded"
            />
            注目商品にする
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">
            保存する
          </button>
          <a href="/admin/products" className="btn-outline">
            キャンセル
          </a>
        </div>
      </form>
    </div>
  );
}
