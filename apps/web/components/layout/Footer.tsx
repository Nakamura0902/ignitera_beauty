import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-10 mt-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">IGNITERA BEAUTY</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              メンズ美容品を横断的に比較。
              <br />
              スペックで選ぶ新しい美容体験。
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">カテゴリ</h3>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li><Link href="/categories/face-wash" className="hover:text-brand">洗顔料</Link></li>
              <li><Link href="/categories/lotion" className="hover:text-brand">化粧水</Link></li>
              <li><Link href="/categories/moisturizer" className="hover:text-brand">保湿クリーム</Link></li>
              <li><Link href="/categories/sunscreen" className="hover:text-brand">日焼け止め</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">サービス</h3>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li><Link href="/products" className="hover:text-brand">すべての商品</Link></li>
              <li><Link href="/compare" className="hover:text-brand">商品を比較</Link></li>
              <li><Link href="/brands" className="hover:text-brand">ブランド一覧</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">掲載について</h3>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li><a href="mailto:contact@ignitera.jp" className="hover:text-brand">掲載のご相談</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} IGNITERA Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
