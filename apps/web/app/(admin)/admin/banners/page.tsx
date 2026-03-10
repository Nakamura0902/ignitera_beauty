import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { createBanner, deleteBanner } from "@/app/(admin)/actions";

export default async function AdminBannersPage() {
  const supabase = await createAdminClient();

  const { data: banners } = await supabase
    .from("banners")
    .select("id, title, image_url, link_url, display_order, is_active")
    .order("display_order");

  type Banner = { id: string; title: string | null; image_url: string; link_url: string | null; display_order: number; is_active: boolean };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">バナー管理</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 追加フォーム */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">バナーを追加</h2>
          <form action={createBanner} className="card p-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                バナー画像 <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="banner_image"
                accept="image/*"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-400">推奨: 横長（例: 1200×400px）</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">タイトル（任意）</label>
              <input
                type="text"
                name="title"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: 新商品入荷キャンペーン"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">リンク先URL（任意）</label>
              <input
                type="url"
                name="link_url"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">表示順</label>
              <input
                type="number"
                name="display_order"
                defaultValue="0"
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary">追加</button>
          </form>
        </div>

        {/* バナー一覧 */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            掲載中のバナー（{banners?.length ?? 0}件）
          </h2>
          <div className="space-y-3">
            {banners && (banners as Banner[]).length > 0 ? (
              (banners as Banner[]).map((banner) => (
                <div key={banner.id} className="card p-3 flex items-start gap-3">
                  <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={banner.image_url}
                      alt={banner.title ?? "バナー"}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {banner.title ?? "（タイトルなし）"}
                    </p>
                    {banner.link_url && (
                      <p className="text-xs text-gray-400 truncate">{banner.link_url}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">表示順: {banner.display_order}</p>
                  </div>
                  <form action={deleteBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      削除
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="card px-4 py-8 text-center text-sm text-gray-400">
                バナーがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
