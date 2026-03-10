-- =============================================
-- banners テーブル（トップページのバナー管理）
-- =============================================

CREATE TABLE banners (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text,
  image_url     text NOT NULL,
  link_url      text,
  display_order int  NOT NULL DEFAULT 0,
  is_active     bool NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 公開バナーは誰でも読める
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  TO public
  USING (is_active = true);

-- Storage: banner-images バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can upload banner images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'banner-images');

CREATE POLICY "Admin can update banner images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'banner-images');

CREATE POLICY "Admin can delete banner images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'banner-images');

CREATE POLICY "Public can view banner images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'banner-images');
