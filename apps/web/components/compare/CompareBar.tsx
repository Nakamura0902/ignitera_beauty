"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const router = useRouter();
  const { items, remove, clear } = useCompareStore();

  if (items.length === 0) return null;

  const slots = [0, 1, 2, 3];

  function handleCompare() {
    const ids = items.map((p) => p.id).join(",");
    router.push(`/compare?ids=${ids}`);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* スロット表示 */}
          <div className="flex flex-1 gap-2">
            {slots.map((i) => {
              const product = items[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border-2",
                    product
                      ? "border-brand bg-gray-50"
                      : "border-dashed border-gray-200 bg-gray-50"
                  )}
                >
                  {product ? (
                    <>
                      {product.main_image_url ? (
                        <Image
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          className="rounded-lg object-contain p-1"
                          sizes="56px"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No img</span>
                      )}
                      <button
                        onClick={() => remove(product.id)}
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-700"
                      >
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300">{i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* アクション */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-500 sm:block">
              {items.length}件選択中
            </span>
            <button
              onClick={clear}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              クリア
            </button>
            <button
              onClick={handleCompare}
              disabled={items.length < 2}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                items.length >= 2
                  ? "bg-brand text-white hover:bg-brand-600"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              )}
            >
              比較する
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
