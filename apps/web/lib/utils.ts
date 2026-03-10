import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SkinType } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(yen: number | null): string {
  if (yen === null) return "価格未定";
  return `¥${yen.toLocaleString("ja-JP")}`;
}

export function formatVolume(ml: number | null): string {
  if (ml === null) return "—";
  return `${ml}ml`;
}

export const SKIN_TYPE_LABELS: Record<SkinType, string> = {
  oily: "脂性肌",
  dry: "乾燥肌",
  combination: "混合肌",
  sensitive: "敏感肌",
  all: "全肌質",
};

export function formatSkinTypes(types: SkinType[]): string {
  if (types.length === 0) return "—";
  return types.map((t) => SKIN_TYPE_LABELS[t]).join("・");
}

// UTMパラメータ付きの外部URLを生成
export function buildExternalUrl(
  url: string,
  source: "product" | "compare" | "category" | "top" = "product"
): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "yutori");
    u.searchParams.set("utm_medium", "listing");
    u.searchParams.set("utm_campaign", source);
    return u.toString();
  } catch {
    return url;
  }
}
