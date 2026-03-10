-- =============================================
-- Yutori v2 - Initial Schema
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- categories
-- =============================================
CREATE TABLE categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  parent_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
  description   text,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- サンプルカテゴリ
INSERT INTO categories (name, slug, display_order) VALUES
  ('スキンケア',   'skincare',   1),
  ('ボディケア',   'bodycare',   2),
  ('ヘアケア',     'haircare',   3),
  ('サンケア',     'suncare',    4);

INSERT INTO categories (name, slug, parent_id, display_order) VALUES
  ('洗顔料',         'face-wash',         (SELECT id FROM categories WHERE slug = 'skincare'), 1),
  ('化粧水',         'lotion',            (SELECT id FROM categories WHERE slug = 'skincare'), 2),
  ('乳液',           'emulsion',          (SELECT id FROM categories WHERE slug = 'skincare'), 3),
  ('美容液',         'serum',             (SELECT id FROM categories WHERE slug = 'skincare'), 4),
  ('保湿クリーム',   'moisturizer',       (SELECT id FROM categories WHERE slug = 'skincare'), 5),
  ('日焼け止め',     'sunscreen',         (SELECT id FROM categories WHERE slug = 'suncare'),  1),
  ('シャンプー',     'shampoo',           (SELECT id FROM categories WHERE slug = 'haircare'), 1),
  ('コンディショナー','conditioner',      (SELECT id FROM categories WHERE slug = 'haircare'), 2),
  ('スタイリング',   'styling',           (SELECT id FROM categories WHERE slug = 'haircare'), 3),
  ('ボディウォッシュ','body-wash',        (SELECT id FROM categories WHERE slug = 'bodycare'), 1);

-- =============================================
-- brands
-- =============================================
CREATE TABLE brands (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  logo_url        text,
  website_url     text,
  description     text,
  billing_email   text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- products
-- =============================================
CREATE TABLE products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id            uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id         uuid NOT NULL REFERENCES categories(id),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text,

  -- 固定スペック（フィルタ・比較用）
  price_yen           integer,
  volume_ml           integer,
  skin_types          text[] NOT NULL DEFAULT '{}',
  -- skin_types values: 'oily' | 'dry' | 'combination' | 'sensitive' | 'all'
  is_fragrance_free   boolean NOT NULL DEFAULT false,
  is_alcohol_free     boolean NOT NULL DEFAULT false,

  -- 柔軟スペック（カテゴリ固有）
  specs_json          jsonb NOT NULL DEFAULT '{}',
  -- 例: {"spf": 50, "pa": "+++", "texture": "gel", "main_ingredients": ["hyaluronic acid"]}

  -- コンテンツ
  main_image_url      text,
  image_urls          text[] NOT NULL DEFAULT '{}',
  external_url        text NOT NULL,

  -- SEO
  meta_title          text,
  meta_description    text,

  -- 管理
  is_published        boolean NOT NULL DEFAULT false,
  is_featured         boolean NOT NULL DEFAULT false,
  display_order       integer NOT NULL DEFAULT 0,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- product_listings（掲載料管理・商品単位）
-- =============================================
CREATE TABLE product_listings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id              uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  fee_yen               integer NOT NULL DEFAULT 2500,
  period_start          date NOT NULL,
  period_end            date,             -- NULL = 自動更新
  status                text NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'past_due', 'cancelled')),
  invoice_issued_at     timestamptz,
  paid_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- インデックス
-- =============================================

-- 商品検索・フィルタ
CREATE INDEX idx_products_category      ON products(category_id);
CREATE INDEX idx_products_brand         ON products(brand_id);
CREATE INDEX idx_products_published     ON products(is_published) WHERE is_published = true;
CREATE INDEX idx_products_featured      ON products(is_featured)  WHERE is_featured = true;
CREATE INDEX idx_products_price         ON products(price_yen);
CREATE INDEX idx_products_skin_types    ON products USING GIN(skin_types);
CREATE INDEX idx_products_specs         ON products USING GIN(specs_json);

-- 全文検索（日本語）
CREATE INDEX idx_products_fts ON products
  USING GIN(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')));

-- 掲載料管理
CREATE INDEX idx_listings_product       ON product_listings(product_id);
CREATE INDEX idx_listings_brand         ON product_listings(brand_id);
CREATE INDEX idx_listings_status        ON product_listings(status, period_start, period_end);

-- ブランドスラグ検索
CREATE INDEX idx_brands_slug            ON brands(slug);
CREATE INDEX idx_categories_slug        ON categories(slug);
CREATE INDEX idx_categories_parent      ON categories(parent_id);

-- =============================================
-- updated_at 自動更新トリガー
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 月次請求計算ビュー
-- =============================================
CREATE VIEW monthly_billing AS
SELECT
  b.id         AS brand_id,
  b.name       AS brand_name,
  b.billing_email,
  COUNT(pl.id) AS active_product_count,
  COUNT(pl.id) * 2500 AS monthly_fee_yen
FROM product_listings pl
JOIN brands b ON pl.brand_id = b.id
WHERE pl.status = 'active'
  AND pl.period_start <= CURRENT_DATE
  AND (pl.period_end IS NULL OR pl.period_end >= CURRENT_DATE)
GROUP BY b.id, b.name, b.billing_email;

-- =============================================
-- Row Level Security（基本設定）
-- =============================================
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_listings ENABLE ROW LEVEL SECURITY;

-- 公開データは誰でも読める
CREATE POLICY "categories_public_read"  ON categories       FOR SELECT USING (true);
CREATE POLICY "brands_public_read"      ON brands           FOR SELECT USING (is_active = true);
CREATE POLICY "products_public_read"    ON products         FOR SELECT USING (is_published = true);

-- 管理操作はサービスロールのみ（Next.js admin側でservice_role_keyを使用）
