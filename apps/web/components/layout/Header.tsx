"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, GitCompare, Menu, X } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "洗顔料", slug: "face-wash" },
  { label: "化粧水", slug: "lotion" },
  { label: "乳液", slug: "emulsion" },
  { label: "美容液", slug: "serum" },
  { label: "保湿クリーム", slug: "moisturizer" },
  { label: "日焼け止め", slug: "sunscreen" },
  { label: "シャンプー", slug: "shampoo" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items } = useCompareStore();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link href="/" className="flex-shrink-0 font-bold text-brand text-xl tracking-tight">
            Yutori
          </Link>

          {/* ナビ (PC) */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="text-gray-600 hover:text-brand transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <Link href="/products" className="text-gray-600 hover:text-brand transition-colors">
              すべて
            </Link>
          </nav>

          {/* 右側アイコン */}
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-gray-500 hover:text-brand">
              <Search size={20} />
            </Link>
            <Link
              href={items.length >= 2 ? `/compare?ids=${items.map((p) => p.id).join(",")}` : "/compare"}
              className="relative text-gray-500 hover:text-brand"
            >
              <GitCompare size={20} />
              {items.length > 0 && (
                <span
                  className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white",
                    items.length >= 2 ? "bg-brand" : "bg-gray-400"
                  )}
                >
                  {items.length}
                </span>
              )}
            </Link>
            {/* ハンバーガー (モバイル) */}
            <button
              className="md:hidden text-gray-500"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="py-2 text-sm text-gray-700 hover:text-brand"
                onClick={() => setMenuOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/products"
              className="py-2 text-sm text-gray-700 hover:text-brand"
              onClick={() => setMenuOpen(false)}
            >
              すべての商品
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
