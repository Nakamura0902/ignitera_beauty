import Link from "next/link";
import { LayoutDashboard, Package, Building2, Tag, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/brands", label: "ブランド管理", icon: Building2 },
  { href: "/admin/listings", label: "掲載料管理", icon: BarChart2 },
  { href: "/admin/categories", label: "カテゴリ管理", icon: Tag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* サイドバー */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link href="/" className="font-bold text-brand">
            IGNITERA BEAUTY
          </Link>
          <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
            Admin
          </span>
        </div>
        <nav className="p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* メイン */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
