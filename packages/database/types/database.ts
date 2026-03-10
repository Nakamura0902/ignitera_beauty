// Supabase Database型定義
// 本番環境では `npx supabase gen types typescript --project-id xxx` で自動生成する

export type SkinType = "oily" | "dry" | "combination" | "sensitive" | "all";
export type ListingStatus = "active" | "past_due" | "cancelled";

// =============================================
// Supabase が期待する Database 型構造
// =============================================
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          description: string | null;
          billing_email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          billing_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          billing_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          brand_id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          price_yen: number | null;
          volume_ml: number | null;
          skin_types: string[];
          is_fragrance_free: boolean;
          is_alcohol_free: boolean;
          specs_json: Record<string, unknown>;
          main_image_url: string | null;
          image_urls: string[];
          external_url: string;
          meta_title: string | null;
          meta_description: string | null;
          is_published: boolean;
          is_featured: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          price_yen?: number | null;
          volume_ml?: number | null;
          skin_types?: string[];
          is_fragrance_free?: boolean;
          is_alcohol_free?: boolean;
          specs_json?: Record<string, unknown>;
          main_image_url?: string | null;
          image_urls?: string[];
          external_url: string;
          meta_title?: string | null;
          meta_description?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_yen?: number | null;
          volume_ml?: number | null;
          skin_types?: string[];
          is_fragrance_free?: boolean;
          is_alcohol_free?: boolean;
          specs_json?: Record<string, unknown>;
          main_image_url?: string | null;
          image_urls?: string[];
          external_url?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_listings: {
        Row: {
          id: string;
          product_id: string;
          brand_id: string;
          fee_yen: number;
          period_start: string;
          period_end: string | null;
          status: string;
          invoice_issued_at: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          brand_id: string;
          fee_yen?: number;
          period_start: string;
          period_end?: string | null;
          status?: string;
          invoice_issued_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          brand_id?: string;
          fee_yen?: number;
          period_start?: string;
          period_end?: string | null;
          status?: string;
          invoice_issued_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      monthly_billing: {
        Row: {
          brand_id: string;
          brand_name: string;
          billing_email: string | null;
          active_product_count: number;
          monthly_fee_yen: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// =============================================
// 便利な型エイリアス
// =============================================
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductListing = Database["public"]["Tables"]["product_listings"]["Row"];
export type MonthlyBilling = Database["public"]["Views"]["monthly_billing"]["Row"];

// ジョイン済み型
export type ProductWithBrand = Product & {
  brands: Pick<Brand, "id" | "name" | "slug" | "logo_url">;
};

export type ProductWithDetails = Product & {
  brands: Brand;
  categories: Category;
};
