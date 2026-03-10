import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ブランド一覧",
  description: "IGNITERA BEAUTYに掲載しているメンズ美容ブランドの一覧。",
};

export const revalidate = 3600;

export default async function BrandsPage() {
  const supabase = await createClient();

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, description")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">ブランド一覧</h1>
      <p className="mb-8 text-sm text-gray-500">{brands?.length ?? 0}ブランド掲載中</p>

      {brands && brands.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="card flex flex-col items-center gap-3 p-5 hover:shadow-md transition-shadow text-center"
            >
              {brand.logo_url ? (
                <div className="relative h-16 w-16">
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-400">
                  {brand.name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{brand.name}</p>
                {brand.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{brand.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">掲載ブランドがありません</p>
        </div>
      )}
    </div>
  );
}
