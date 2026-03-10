"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, GitCompare, Menu, X, ChevronRight } from "lucide-react";
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
  { label: "ボディウォッシュ", slug: "body-wash" },
];

const NAV_LINKS = [
  { label: "すべての商品", href: "/products" },
  { label: "商品を比較", href: "/compare" },
  { label: "ブランド一覧", href: "/brands" },
];

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { items } = useCompareStore();

  function close() {
    setDrawerOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* ハンバーガー（常時表示） */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex-shrink-0 p-1 text-gray-500 hover:text-brand transition-colors"
              aria-label="メニューを開く"
            >
              <Menu size={22} />
            </button>

            {/* ロゴ */}
            <Link href="/" className="font-bold text-brand text-lg tracking-tight">
              IGNITERA BEAUTY
            </Link>

            {/* 右側アイコン */}
            <div className="flex items-center gap-3">
              <Link href="/products" className="text-gray-500 hover:text-brand" aria-label="商品を検索">
                <Search size={20} />
              </Link>
              <Link
                href={items.length >= 2 ? `/compare?ids=${items.map((p) => p.id).join(",")}` : "/compare"}
                className="relative text-gray-500 hover:text-brand"
                aria-label="比較リスト"
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
            </div>
          </div>
        </div>
      </header>

      {/* オーバーレイ */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={close}
        />
      )}

      {/* ドロワー（左からスライドイン） */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ドロワーヘッダー */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <Link href="/" className="font-bold text-brand text-base" onClick={close}>
            IGNITERA BEAUTY
          </Link>
          <button
            onClick={close}
            className="p-1 text-gray-400 hover:text-gray-700"
            aria-label="メニューを閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* ドロワーコンテンツ */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* カテゴリ */}
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              カテゴリ
            </p>
            <ul className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    onClick={close}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors"
                  >
                    <span>{cat.label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-4 my-3 border-t border-gray-100" />

          {/* メインナビ */}
          <div className="px-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              メニュー
            </p>
            <ul className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ドロワーフッター */}
        <div className="border-t border-gray-100 px-4 py-4">
          <a
            href="mailto:contact@ignitera.jp"
            className="block rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            onClick={close}
          >
            掲載のご相談
          </a>
        </div>
      </div>
    </>
  );
}
