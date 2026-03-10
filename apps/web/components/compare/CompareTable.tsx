"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import {
  formatPrice,
  formatVolume,
  formatSkinTypes,
  buildExternalUrl,
} from "@/lib/utils";
import type { ProductWithDetails, SkinType } from "@/types/database";

interface CompareTableProps {
  products: ProductWithDetails[];
}

type SpecRow = {
  label: string;
  getValue: (p: ProductWithDetails) => string | React.ReactNode;
};

const SPEC_ROWS: SpecRow[] = [
  { label: "価格", getValue: (p) => formatPrice(p.price_yen) },
  { label: "容量", getValue: (p) => formatVolume(p.volume_ml) },
  { label: "対象肌質", getValue: (p) => formatSkinTypes(p.skin_types as SkinType[]) },
  {
    label: "無香料",
    getValue: (p) => (
      <span className={p.is_fragrance_free ? "text-green-600 font-medium" : "text-gray-400"}>
        {p.is_fragrance_free ? "○" : "—"}
      </span>
    ),
  },
  {
    label: "ノンアルコール",
    getValue: (p) => (
      <span className={p.is_alcohol_free ? "text-green-600 font-medium" : "text-gray-400"}>
        {p.is_alcohol_free ? "○" : "—"}
      </span>
    ),
  },
  {
    label: "SPF",
    getValue: (p) =>
      (p.specs_json as Record<string, unknown>)?.spf
        ? `SPF${(p.specs_json as Record<string, unknown>).spf}`
        : "—",
  },
  {
    label: "PA",
    getValue: (p) =>
      (p.specs_json as Record<string, unknown>)?.pa
        ? String((p.specs_json as Record<string, unknown>).pa)
        : "—",
  },
  {
    label: "テクスチャー",
    getValue: (p) =>
      (p.specs_json as Record<string, unknown>)?.texture
        ? String((p.specs_json as Record<string, unknown>).texture)
        : "—",
  },
];

export function CompareTable({ products }: CompareTableProps) {
  const { remove } = useCompareStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {/* ラベル列 */}
            <th className="w-28 min-w-28 border-b border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500" />
            {/* 商品列 */}
            {products.map((product) => (
              <th
                key={product.id}
                className="min-w-44 border-b border-gray-200 px-4 py-3 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  {/* 削除ボタン */}
                  <button
                    onClick={() => remove(product.id)}
                    className="self-end text-gray-300 hover:text-gray-500"
                  >
                    <X size={14} />
                  </button>
                  {/* 画像 */}
                  <div className="relative h-20 w-20">
                    {product.main_image_url ? (
                      <Image
                        src={product.main_image_url}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded bg-gray-100" />
                    )}
                  </div>
                  {/* ブランド名 */}
                  <span className="text-xs text-gray-500">{product.brands.name}</span>
                  {/* 商品名 */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-brand line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  {/* 公式へ */}
                  <a
                    href={buildExternalUrl(product.external_url, "compare")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
                  >
                    公式サイトへ
                    <ExternalLink size={11} />
                  </a>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {SPEC_ROWS.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border-b border-gray-100 px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                {row.label}
              </td>
              {products.map((product) => (
                <td
                  key={product.id}
                  className="border-b border-gray-100 px-4 py-3 text-center text-sm text-gray-800"
                >
                  {row.getValue(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
