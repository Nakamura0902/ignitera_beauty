import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminCategoriesPage() {
  const supabase = await createAdminClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, display_order")
    .order("display_order");

  const topLevel = (categories as unknown as { id: string; name: string; slug: string; parent_id: string | null; display_order: number }[] | null)
    ?.filter((c) => !c.parent_id) ?? [];
  const children = (categories as unknown as { id: string; name: string; slug: string; parent_id: string | null; display_order: number }[] | null)
    ?.filter((c) => c.parent_id) ?? [];

  async function createCategory(formData: FormData) {
    "use server";
    const supabase = await createAdminClient();
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
    const parentId = (formData.get("parent_id") as string) || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("categories").insert({
      name,
      slug,
      parent_id: parentId,
      display_order: parseInt(formData.get("display_order") as string) || 0,
    });

    redirect("/admin/categories");
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">カテゴリ管理</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 追加フォーム */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">カテゴリを追加</h2>
          <form action={createCategory} className="card p-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                カテゴリ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="例: 洗顔料"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                親カテゴリ（サブカテゴリの場合）
              </label>
              <select name="parent_id" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">なし（トップレベル）</option>
                {topLevel.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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

        {/* カテゴリ一覧 */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-800">カテゴリ一覧</h2>
          <div className="card divide-y divide-gray-100">
            {topLevel.map((top) => (
              <div key={top.id}>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm font-semibold text-gray-800">{top.name}</span>
                  <span className="text-xs text-gray-400">{top.slug}</span>
                </div>
                {children
                  .filter((c) => c.parent_id === top.id)
                  .map((child) => (
                    <div key={child.id} className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-4 py-2">
                      <span className="pl-3 text-xs text-gray-600 before:mr-2 before:text-gray-300 before:content-['└']">
                        {child.name}
                      </span>
                      <span className="text-xs text-gray-400">{child.slug}</span>
                    </div>
                  ))}
              </div>
            ))}
            {topLevel.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">カテゴリがありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
