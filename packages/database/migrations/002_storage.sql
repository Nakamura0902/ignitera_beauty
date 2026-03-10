-- =============================================
-- Storage: product-images バケット
-- =============================================

-- バケット作成（public: 誰でも画像を参照可能）
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 管理者（service_role）のみアップロード・削除可能
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin can update product images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'product-images');

-- 全ユーザーが参照可能
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');
