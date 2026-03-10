"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { cn, formatPrice, formatSkinTypes } from "@/lib/utils";
import { useCompareStore } from "@/store/compareStore";
import type { ProductWithBrand } from "@/types/database";

interface ProductCardProps {
  product: ProductWithBrand;
}

export function ProductCard({ product }: ProductCardProps) {
  const { add, remove, has, isFull } = useCompareStore();
  const inCompare = has(product.id);

  function handleCompareToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // Linkへの伝播を止め、比較ボタン押下時に詳細ページへ飛ばない
    if (inCompare) {
      remove(product.id);
    } else {
      add(product);
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden transition-shadow hover:shadow-md">
        {/* 商品画像 */}
        <div className="relative aspect-square bg-gray-50">
          {product.main_image_url ? (
            <Image
              src={product.main_image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 text-sm">
              No Image
            </div>
          )}
          {/* 比較ボタン */}
          <button
            onClick={handleCompareToggle}
            disabled={!inCompare && isFull()}
            className={cn(
              "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-all",
              inCompare
                ? "border-brand bg-brand text-white"
                : isFull()
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-white text-gray-600 hover:border-brand hover:text-brand"
            )}
            title={inCompare ? "比較から削除" : "比較に追加"}
          >
            {inCompare ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {/* 商品情報 */}
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-0.5">{product.brands.name}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price_yen)}
            </span>
            {product.volume_ml && (
              <span className="text-xs text-gray-400">{product.volume_ml}ml</span>
            )}
          </div>
          {product.skin_types.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {formatSkinTypes(product.skin_types as import("@/types/database").SkinType[])}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
