"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductWithBrand } from "@/types/database";

const MAX_COMPARE = 4;

interface CompareStore {
  items: ProductWithBrand[];
  add: (product: ProductWithBrand) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product) => {
        const { items } = get();
        if (items.length >= MAX_COMPARE) return;
        if (items.some((p) => p.id === product.id)) return;
        set({ items: [...items, product] });
      },

      remove: (productId) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },

      clear: () => set({ items: [] }),

      has: (productId) => get().items.some((p) => p.id === productId),

      isFull: () => get().items.length >= MAX_COMPARE,
    }),
    {
      name: "yutori-compare",
    }
  )
);
