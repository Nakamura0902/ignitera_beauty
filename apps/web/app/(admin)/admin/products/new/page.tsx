import { createAdminClient } from "@/lib/supabase/server";
import { createProduct } from "@/app/(admin)/actions";

export default async function NewProductPage() {
  const supabase = await createAdminClient();

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("id, name").eq("is_active", true).order("name"),
    supabase.from("categories").select("id, name, slug").order("display_order"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">商品を追加</h1>

      <form action={createProduct} className="card max-w-2xl p-6 space-y-5">
        {/* ブランド */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ブランド <span className="text-red-500">*</span>
          </label>
          <select name="brand_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">選択してください</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* カテゴリ */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select name="category_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">選択してください</option>
            {categories?.map((c) => (
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="例: モイスチャライザー SPF15"
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">商品説明</label>
          <textarea
            name="description"
            rows={4}
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="3500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">容量（ml）</label>
            <input
              type="number"
              name="volume_ml"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="100"
            />
          </div>
        </div>

        {/* 肌タイプ */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">対象肌質（複数選択可）</label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: "oily", label: "脂性肌" },
              { value: "dry", label: "乾燥肌" },
              { value: "combination", label: "混合肌" },
              { value: "sensitive", label: "敏感肌" },
              { value: "all", label: "全肌質" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="skin_types" value={value} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* フラグ */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_fragrance_free" className="rounded" />
            無香料
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_alcohol_free" className="rounded" />
            ノンアルコール
          </label>
        </div>

        {/* 追加スペック（JSON） */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            追加スペック（JSON形式）
          </label>
          <textarea
            name="specs_json"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
            placeholder='{"spf": 50, "pa": "+++", "texture": "gel"}'
          />
        </div>

        {/* 商品画像 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">商品画像</label>
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="https://brand.com/products/xxx"
          />
        </div>

        {/* 公開設定 */}
        <div className="flex gap-6 border-t border-gray-100 pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" className="rounded" />
            公開する
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" className="rounded" />
            注目商品にする
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">
            商品を追加
          </button>
          <a href="/admin/products" className="btn-outline">
            キャンセル
          </a>
        </div>
      </form>
    </div>
  );
}
