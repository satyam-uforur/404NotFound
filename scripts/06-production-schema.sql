-- ============================================================================
-- 404NotFoundIN - Production Schema Migration
-- Run this in the DATA Supabase project SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. ALTER EXISTING TABLES
-- ============================================================================

-- Products: add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 't-shirt'
  CHECK (product_type IN ('t-shirt', 'hoodie', 'cap', 'jacket', 'mug', 'sticker', 'accessory', 'phone-case', 'poster', 'notebook'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'draft', 'archived'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_percent DECIMAL(5,2) DEFAULT 18;
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Categories: add parent for subcategories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Cart items: add variant support
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS color TEXT;

-- Order items: add variant info
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color TEXT;

-- Orders: add coupon fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0;

-- ============================================================================
-- 2. NEW TABLES
-- ============================================================================

-- Collections (product groupings like "Summer Drop", "Limited Edition")
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  size TEXT,
  color TEXT,
  color_hex TEXT,
  price DECIMAL(10,2),
  mrp DECIMAL(10,2),
  stock INT DEFAULT 0,
  weight DECIMAL(8,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- Variant Images (multiple images per color)
CREATE TABLE IF NOT EXISTS variant_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Tags (normalized)
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, tag)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  images JSONB DEFAULT '[]',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'restock', 'adjustment', 'return', 'reservation', 'release')),
  quantity_change INT NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(product_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_variant_images_variant ON variant_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(product_id) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(display_order) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory_logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE is_active = TRUE AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_cart_variant ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-sync product stock from variants
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(stock), 0) FROM product_variants
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_active = TRUE
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(stock), 0) FROM product_variants
      WHERE product_id = OLD.product_id AND is_active = TRUE
    )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_variants;
CREATE TRIGGER sync_product_stock_trigger
  AFTER INSERT OR UPDATE OF stock OR DELETE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION sync_product_stock();

-- Auto-generate slug for products if empty
CREATE OR REPLACE FUNCTION auto_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(NEW.name);
    NEW.slug := REGEXP_REPLACE(NEW.slug, '[^a-z0-9]+', '-', 'g');
    NEW.slug := BTRIM(NEW.slug, '-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_product_slug_trigger ON products;
CREATE TRIGGER auto_product_slug_trigger
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION auto_product_slug();

-- ============================================================================
-- 5. RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Product Variants: public read for active, full admin
CREATE POLICY "Active variants viewable by everyone" ON product_variants
  FOR SELECT USING (is_active = TRUE AND product_id IN (SELECT id FROM products WHERE is_active = TRUE));
CREATE POLICY "Admin can manage variants" ON product_variants
  FOR ALL USING (true) WITH CHECK (true);

-- Variant Images: public read
CREATE POLICY "Variant images viewable by everyone" ON variant_images
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage variant images" ON variant_images
  FOR ALL USING (true) WITH CHECK (true);

-- Product Tags: public read
CREATE POLICY "Product tags viewable by everyone" ON product_tags
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage product tags" ON product_tags
  FOR ALL USING (true) WITH CHECK (true);

-- Reviews: public read approved, users can create
CREATE POLICY "Approved reviews viewable by everyone" ON reviews
  FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage reviews" ON reviews
  FOR ALL USING (true) WITH CHECK (true);

-- Coupons: admin only
CREATE POLICY "Admin can manage coupons" ON coupons
  FOR ALL USING (true) WITH CHECK (true);

-- Banners: public read active
CREATE POLICY "Active banners viewable by everyone" ON banners
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin can manage banners" ON banners
  FOR ALL USING (true) WITH CHECK (true);

-- Inventory Logs: admin only
CREATE POLICY "Admin can manage inventory logs" ON inventory_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Collections: public read
CREATE POLICY "Active collections viewable by everyone" ON collections
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin can manage collections" ON collections
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. RELOAD SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';
