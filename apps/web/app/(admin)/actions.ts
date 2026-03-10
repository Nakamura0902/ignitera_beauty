"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

// =============================================
// Brand actions
// =============================================
export async function createBrand(formData: FormData) {
  const supabase = await createAdminClient();
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("brands").insert({
    name,
    slug,
    website_url: (formData.get("website_url") as string) || null,
    billing_email: (formData.get("billing_email") as string) || null,
    description: (formData.get("description") as string) || null,
    logo_url: null,
    is_active: true,
  });
  redirect("/admin/brands");
}

// =============================================
// Storage helper
// =============================================
async function uploadProductImage(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  imageFile: File,
  fileName: string
): Promise<string | null> {
  const { data: uploadData } = await supabase.storage
    .from("product-images")
    .upload(fileName, imageFile, { upsert: true });
  if (!uploadData) return null;
  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(uploadData.path);
  return urlData.publicUrl;
}

// =============================================
// Product actions
// =============================================
export async function createProduct(formData: FormData) {
  const supabase = await createAdminClient();

  const name = formData.get("name") as string;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");

  const skinTypes = formData.getAll("skin_types") as string[];

  const specsRaw = formData.get("specs_json") as string;
  let specs: Record<string, unknown> = {};
  try {
    if (specsRaw) specs = JSON.parse(specsRaw);
  } catch {
    // invalid JSON は無視
  }

  // 画像アップロード
  let main_image_url: string | null = null;
  const imageFile = formData.get("main_image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    main_image_url = await uploadProductImage(supabase, imageFile, `${slug}-${Date.now()}.${ext}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("products").insert({
    brand_id: formData.get("brand_id") as string,
    category_id: formData.get("category_id") as string,
    name,
    slug,
    description: (formData.get("description") as string) || null,
    price_yen: formData.get("price_yen") ? parseInt(formData.get("price_yen") as string) : null,
    volume_ml: formData.get("volume_ml") ? parseInt(formData.get("volume_ml") as string) : null,
    skin_types: skinTypes,
    is_fragrance_free: formData.get("is_fragrance_free") === "on",
    is_alcohol_free: formData.get("is_alcohol_free") === "on",
    specs_json: specs,
    main_image_url,
    external_url: formData.get("external_url") as string,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
  });
  redirect("/admin/products");
}

// =============================================
// Product update action
// =============================================
export async function updateProduct(formData: FormData) {
  const supabase = await createAdminClient();
  const id = formData.get("id") as string;

  const skinTypes = formData.getAll("skin_types") as string[];

  const specsRaw = formData.get("specs_json") as string;
  let specs: Record<string, unknown> = {};
  try {
    if (specsRaw) specs = JSON.parse(specsRaw);
  } catch {
    // ignore
  }

  // 画像アップロード（新しい画像が選択された場合のみ更新）
  let main_image_url: string | undefined = undefined;
  const imageFile = formData.get("main_image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const uploaded = await uploadProductImage(supabase, imageFile, `${id}-${Date.now()}.${ext}`);
    if (uploaded) main_image_url = uploaded;
  }

  const updateData: Record<string, unknown> = {
    brand_id: formData.get("brand_id") as string,
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    price_yen: formData.get("price_yen") ? parseInt(formData.get("price_yen") as string) : null,
    volume_ml: formData.get("volume_ml") ? parseInt(formData.get("volume_ml") as string) : null,
    skin_types: skinTypes,
    is_fragrance_free: formData.get("is_fragrance_free") === "on",
    is_alcohol_free: formData.get("is_alcohol_free") === "on",
    specs_json: specs,
    external_url: formData.get("external_url") as string,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
  };
  if (main_image_url !== undefined) updateData.main_image_url = main_image_url;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("products").update(updateData).eq("id", id);

  redirect("/admin/products");
}

// =============================================
// Listing actions
// =============================================
export async function addListing(formData: FormData) {
  const supabase = await createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("product_listings").insert({
    product_id: formData.get("product_id") as string,
    brand_id: formData.get("brand_id") as string,
    fee_yen: 2500,
    period_start: formData.get("period_start") as string,
    period_end: null,
    status: "active",
    invoice_issued_at: null,
    paid_at: null,
  });
  redirect("/admin/listings");
}
