-- ============================================================================
-- 404NotFoundIN - Data Supabase Complete Setup
-- Run this ENTIRE file in: Supabase Dashboard → SQL Editor → New Query → Run
-- Project: orrbblmoxpeyrnlvrxwl (Data Supabase)
-- ============================================================================
-- NOTE: user_id columns are plain UUID (no FK to auth.users) because
-- authentication happens on a separate Auth Supabase project.
-- All API routes use the service role key which bypasses RLS.
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. COLLECTIONS TABLE (must be before products ALTER)
-- ============================================================================
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

-- ============================================================================
-- 4. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2),
  sku TEXT UNIQUE,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  brand TEXT,
  product_type TEXT DEFAULT 't-shirt'
    CHECK (product_type IN ('t-shirt', 'hoodie', 'cap', 'jacket', 'mug', 'sticker', 'accessory', 'phone-case', 'poster', 'notebook')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'draft', 'archived')),
  weight DECIMAL(8,2),
  dimensions JSONB DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  low_stock_threshold INT DEFAULT 5,
  tax_percent DECIMAL(5,2) DEFAULT 18,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. PRODUCT VARIANTS
-- ============================================================================
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

-- ============================================================================
-- 6. VARIANT IMAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS variant_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. PRODUCT TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, tag)
);

-- ============================================================================
-- 8. CART ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. ADDRESSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'completed', 'failed', 'refunded'
  )),
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  coupon_code TEXT,
  coupon_discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address_id UUID REFERENCES addresses(id),
  billing_address_id UUID REFERENCES addresses(id),
  tracking_number TEXT,
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  size TEXT,
  color TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. WISHLIST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 13. REVIEWS
-- ============================================================================
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

-- ============================================================================
-- 14. COUPONS
-- ============================================================================
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

-- ============================================================================
-- 15. BANNERS
-- ============================================================================
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

-- ============================================================================
-- 16. INVENTORY LOGS
-- ============================================================================
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
-- 17. ORDER APPROVALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
  admin_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 18. ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 19. EMAIL LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_type TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 20. CONTACT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 21. NEWSLETTER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 22. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_featured_active ON products(featured) WHERE is_active = TRUE AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_variant ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_order ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
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
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- ============================================================================
-- 23. TRIGGERS
-- ============================================================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_approvals_updated_at BEFORE UPDATE ON order_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- Auto-generate slug for products
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
-- 24. SEED DATA - CATEGORIES (12 genres)
-- ============================================================================
INSERT INTO categories (id, name, slug, description, display_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Music', 'music', 'Music-inspired premium merchandise', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Meme Culture', 'meme-culture', 'Internet meme and humor culture', 2),
  ('c0000000-0000-0000-0000-000000000003', 'Devotional', 'devotional', 'Spiritual and devotional themes', 3),
  ('c0000000-0000-0000-0000-000000000004', 'Anime', 'anime', 'Anime-inspired collections', 4),
  ('c0000000-0000-0000-0000-000000000005', 'Gaming', 'gaming', 'Gaming culture merchandise', 5),
  ('c0000000-0000-0000-0000-000000000006', 'Coding', 'coding', 'Developer and programmer gear', 6),
  ('c0000000-0000-0000-0000-000000000007', 'AI & Tech', 'ai-tech', 'Artificial intelligence and technology', 7),
  ('c0000000-0000-0000-0000-000000000008', 'Creator Merch', 'creator-merch', 'Content creator merchandise', 8),
  ('c0000000-0000-0000-0000-000000000009', 'Cyberpunk', 'cyberpunk', 'Cyberpunk and futuristic designs', 9),
  ('c0000000-0000-0000-0000-000000000010', 'Vintage Web', 'vintage-web', 'Retro internet and vintage web nostalgia', 10),
  ('c0000000-0000-0000-0000-000000000011', 'Minimal', 'minimal', 'Clean minimal aesthetic designs', 11),
  ('c0000000-0000-0000-0000-000000000012', 'Internet Humor', 'internet-humor', 'Internet culture and humor', 12)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 25. SEED DATA - PRODUCTS (60 products, 5 per category)
-- ============================================================================
INSERT INTO products (category_id, name, slug, description, long_description, price, mrp, sku, image_url, images, stock, is_active, featured, status, product_type, tags) VALUES
-- Music (5)
('c0000000-0000-0000-0000-000000000001', 'Signal Static Tee', 'signal-static-tee', 'Frequency-inspired premium cotton tee', 'Premium heavyweight cotton tee with signal static graphic. Designed for audiophiles who live between frequencies.', 599, 899, 'MUS-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 80, true, true, 'active', 't-shirt', '["music","signal","premium"]'),
('c0000000-0000-0000-0000-000000000001', 'Echoform Hoodie', 'echoform-hoodie', 'Reverb-infused oversized hoodie', 'Ultra-soft fleece hoodie with echoform resonance design. Perfect for late-night listening sessions.', 1299, 1899, 'MUS-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 45, true, true, 'active', 'hoodie', '["music","hoodie","premium"]'),
('c0000000-0000-0000-0000-000000000001', 'Noise Archive Oversized Tee', 'noise-archive-oversized-tee', 'Archive-grade noise print oversized fit', 'Drop-shoulder oversized tee featuring noise archive waveform pattern. Heavy 280gsm cotton.', 749, 1099, 'MUS-003', 'https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop"]'::jsonb, 60, true, false, 'active', 't-shirt', '["music","oversized"]'),
('c0000000-0000-0000-0000-000000000001', 'Frequency Cap', 'frequency-cap', 'Structured cap with frequency wave design', 'Six-panel structured cap with embroidered frequency wave. Adjustable strap closure.', 499, 749, 'MUS-004', 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop"]'::jsonb, 100, true, false, 'active', 'cap', '["music","cap","accessories"]'),
('c0000000-0000-0000-0000-000000000001', 'Mono Pulse Jacket', 'mono-pulse-jacket', 'Monochrome pulse wave bomber jacket', 'Lightweight bomber jacket with mono pulse embroidery. Water-resistant shell with satin lining.', 1899, 2799, 'MUS-005', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"]'::jsonb, 30, true, true, 'active', 'jacket', '["music","jacket","premium"]'),

-- Meme Culture (5)
('c0000000-0000-0000-0000-000000000002', 'Terminal Humor Tee', 'terminal-humor-tee', 'Command line comedy in cotton form', 'Premium tee with terminal humor graphics. For those who debug with memes.', 549, 799, 'MEM-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 90, true, true, 'active', 't-shirt', '["meme","terminal","coding"]'),
('c0000000-0000-0000-0000-000000000002', 'Lag Detected Hoodie', 'lag-detected-hoodie', 'For when life buffers', 'Cozy hoodie with lag detection warning print. Relatable internet culture at its finest.', 1199, 1699, 'MEM-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 55, true, true, 'active', 'hoodie', '["meme","gaming","hoodie"]'),
('c0000000-0000-0000-0000-000000000002', 'Ctrl+Chaos Tee', 'ctrl-chaos-tee', 'Keyboard shortcut to mayhem', 'Shortcuts to chaos printed on premium cotton. When order meets disorder.', 499, 749, 'MEM-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 70, true, false, 'active', 't-shirt', '["meme","keyboard"]'),
('c0000000-0000-0000-0000-000000000002', 'Offline Relic Cap', 'offline-relic-cap', 'Vintage offline aesthetic', 'Structured cap celebrating the lost art of being offline. Six-panel construction.', 449, 699, 'MEM-004', 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop"]'::jsonb, 85, true, false, 'active', 'cap', '["meme","cap","retro"]'),
('c0000000-0000-0000-0000-000000000002', 'Error Core Tee', 'error-core-tee', 'Glitch aesthetic basics', 'Error core aesthetic on premium jersey cotton. Embrace the beautiful bugs.', 579, 849, 'MEM-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 65, true, false, 'active', 't-shirt', '["meme","glitch"]'),

-- Devotional (5)
('c0000000-0000-0000-0000-000000000003', 'Sacred Signal Tee', 'sacred-signal-tee', 'Divine frequency print tee', 'Sacred geometry meets signal processing. Premium cotton with devotional print.', 599, 899, 'DEV-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 70, true, true, 'active', 't-shirt', '["devotional","sacred"]'),
('c0000000-0000-0000-0000-000000000003', 'Archive Prayer Hoodie', 'archive-prayer-hoodie', 'Meditative comfort wear', 'Heavyweight hoodie with archive prayer motif. Contemplative design for mindful moments.', 1399, 1999, 'DEV-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 40, true, true, 'active', 'hoodie', '["devotional","hoodie"]'),
('c0000000-0000-0000-0000-000000000003', 'Temple Static Oversized', 'temple-static-oversized', 'Sacred static distortion oversized tee', 'Oversized drop-shoulder tee blending temple architecture with static noise aesthetics.', 799, 1199, 'DEV-003', 'https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop"]'::jsonb, 50, true, false, 'active', 't-shirt', '["devotional","temple"]'),
('c0000000-0000-0000-0000-000000000003', 'Eternal Frequency Tee', 'eternal-frequency-tee', 'Timeless vibration print', 'Eternal frequency waveform on premium organic cotton. Spiritual meets scientific.', 649, 949, 'DEV-004', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop"]'::jsonb, 55, true, false, 'active', 't-shirt', '["devotional","frequency"]'),
('c0000000-0000-0000-0000-000000000003', 'Divine Echo Jacket', 'divine-echo-jacket', 'Resonant spiritual bomber', 'Bomber jacket with divine echo embroidery. Premium shell with spiritual undertones.', 1799, 2599, 'DEV-005', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"]'::jsonb, 25, true, true, 'active', 'jacket', '["devotional","jacket"]'),

-- Anime (5)
('c0000000-0000-0000-0000-000000000004', 'Void Frame Tee', 'void-frame-tee', 'Anime void aesthetic tee', 'Void frame design inspired by anime dimensions. Premium cotton construction.', 599, 899, 'ANI-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 85, true, true, 'active', 't-shirt', '["anime","void"]'),
('c0000000-0000-0000-0000-000000000004', 'Ghostline Hoodie', 'ghostline-hoodie', 'Phantom line art hoodie', 'Ghost line art featuring spectral anime influences. Ultra-soft fleece interior.', 1299, 1899, 'ANI-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 50, true, true, 'active', 'hoodie', '["anime","hoodie"]'),
('c0000000-0000-0000-0000-000000000004', 'Memory Render Tee', 'memory-render-tee', 'Rendered memory fragment tee', 'Memory fragment design with anime render aesthetics. Soft-washed cotton.', 649, 949, 'ANI-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 60, true, false, 'active', 't-shirt', '["anime","render"]'),
('c0000000-0000-0000-0000-000000000004', 'Parallel Soul Oversized', 'parallel-soul-oversized', 'Alternate dimension oversized fit', 'Parallel soul motif on oversized drop-shoulder tee. 280gsm heavyweight cotton.', 799, 1199, 'ANI-004', 'https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop"]'::jsonb, 45, true, false, 'active', 't-shirt', '["anime","oversized"]'),
('c0000000-0000-0000-0000-000000000004', 'Static Universe Tee', 'static-universe-tee', 'Universe in static noise', 'Static noise rendering of anime universes. Limited edition premium print.', 699, 999, 'ANI-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 40, true, true, 'active', 't-shirt', '["anime","static"]'),

-- Gaming (5)
('c0000000-0000-0000-0000-000000000005', 'Respawn Artifact Tee', 'respawn-artifact-tee', 'Respawn point activated', 'Respawn artifact design for gamers who never give up. Premium ring-spun cotton.', 599, 899, 'GAM-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 95, true, true, 'active', 't-shirt', '["gaming","respawn"]'),
('c0000000-0000-0000-0000-000000000005', 'Save State Hoodie', 'save-state-hoodie', 'Checkpoint saved comfort', 'Save state checkpoint hoodie for the cautious gamer. Dual-pocket fleece.', 1349, 1949, 'GAM-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 45, true, true, 'active', 'hoodie', '["gaming","hoodie"]'),
('c0000000-0000-0000-0000-000000000005', 'Final Ping Tee', 'final-ping-tee', 'Last ping standing', 'Final ping design celebrating clutch moments. Lightweight breathable cotton.', 549, 799, 'GAM-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 70, true, false, 'active', 't-shirt', '["gaming","ping"]'),
('c0000000-0000-0000-0000-000000000005', 'Critical Render Jacket', 'critical-render-jacket', 'Frame-perfect outerwear', 'Critical render bomber with gaming-inspired embroidery. Performance shell fabric.', 1699, 2499, 'GAM-004', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"]'::jsonb, 30, true, true, 'active', 'jacket', '["gaming","jacket"]'),
('c0000000-0000-0000-0000-000000000005', 'Input Delay Tee', 'input-delay-tee', 'Blame the lag tee', 'Input delay humor on premium jersey. For those who always blame the connection.', 499, 749, 'GAM-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 80, true, false, 'active', 't-shirt', '["gaming","lag"]'),

-- Coding (5)
('c0000000-0000-0000-0000-000000000006', 'Undefined Signal Tee', 'undefined-signal-tee', 'typeof signal === undefined', 'Undefined signal design for developers who live in the console. Premium cotton.', 599, 899, 'COD-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 90, true, true, 'active', 't-shirt', '["coding","javascript"]'),
('c0000000-0000-0000-0000-000000000006', 'Null Memory Hoodie', 'null-memory-hoodie', 'NullPointerException comfort', 'Null memory allocation hoodie. Warm fleece for cold debugging nights.', 1249, 1799, 'COD-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 50, true, true, 'active', 'hoodie', '["coding","hoodie"]'),
('c0000000-0000-0000-0000-000000000006', 'Syntax Collapse Tee', 'syntax-collapse-tee', 'Unexpected token: life', 'Syntax error visualized as wearable art. When your code has other plans.', 549, 799, 'COD-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 75, true, false, 'active', 't-shirt', '["coding","syntax"]'),
('c0000000-0000-0000-0000-000000000006', 'Runtime Artifact Tee', 'runtime-artifact-tee', 'Compiled at runtime', 'Runtime artifact design celebrating the beauty of just-in-time compilation.', 579, 849, 'COD-004', 'https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop"]'::jsonb, 65, true, false, 'active', 't-shirt', '["coding","runtime"]'),
('c0000000-0000-0000-0000-000000000006', 'Compile Silence Oversized', 'compile-silence-oversized', 'Waiting for compile...', 'Oversized tee for the eternal compile wait. Heavy 280gsm drop-shoulder fit.', 749, 1099, 'COD-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 45, true, true, 'active', 't-shirt', '["coding","compile"]'),

-- AI & Tech (5)
('c0000000-0000-0000-0000-000000000007', 'Neural Ghost Tee', 'neural-ghost-tee', 'Neural network apparition', 'Neural ghost design merging AI with spectral aesthetics. Premium cotton print.', 649, 949, 'AIT-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 70, true, true, 'active', 't-shirt', '["ai","neural"]'),
('c0000000-0000-0000-0000-000000000007', 'Synthetic Emotion Hoodie', 'synthetic-emotion-hoodie', 'AI feelings simulation', 'Synthetic emotion visualization on premium fleece. When machines learn to feel.', 1399, 1999, 'AIT-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 40, true, true, 'active', 'hoodie', '["ai","hoodie"]'),
('c0000000-0000-0000-0000-000000000007', 'Prompt Collapse Tee', 'prompt-collapse-tee', 'Token limit exceeded', 'Prompt engineering humor meets premium fashion. When tokens run out.', 599, 899, 'AIT-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 55, true, false, 'active', 't-shirt', '["ai","prompt"]'),
('c0000000-0000-0000-0000-000000000007', 'Model Drift Jacket', 'model-drift-jacket', 'Weights shifted outerwear', 'Model drift bomber jacket with gradient embroidery. AI training visualized.', 1899, 2799, 'AIT-004', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"]'::jsonb, 25, true, true, 'active', 'jacket', '["ai","jacket"]'),
('c0000000-0000-0000-0000-000000000007', 'Latent Space Tee', 'latent-space-tee', 'Embedding dimension visualized', 'Latent space visualization on organic cotton. Where AI dreams live.', 649, 949, 'AIT-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 60, true, false, 'active', 't-shirt', '["ai","latent"]'),

-- Creator Merch (5)
('c0000000-0000-0000-0000-000000000008', 'Broadcast Artifact Tee', 'broadcast-artifact-tee', 'Live stream inspired design', 'Broadcast artifact pattern from the golden age of streaming. Premium cotton.', 549, 799, 'CRE-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 80, true, true, 'active', 't-shirt', '["creator","stream"]'),
('c0000000-0000-0000-0000-000000000008', 'Viral Signal Hoodie', 'viral-signal-hoodie', 'Trending signal comfort wear', 'Viral signal waveform on heavyweight fleece. For content that breaks the algorithm.', 1299, 1899, 'CRE-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 45, true, false, 'active', 'hoodie', '["creator","viral"]'),
('c0000000-0000-0000-0000-000000000008', 'Feed Collapse Tee', 'feed-collapse-tee', 'Infinite scroll ended', 'Feed collapse design when the algorithm gives up. Soft-washed jersey cotton.', 499, 749, 'CRE-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 65, true, false, 'active', 't-shirt', '["creator","feed"]'),
('c0000000-0000-0000-0000-000000000008', 'Render Drop Tee', 'render-drop-tee', 'Drop rendered successfully', 'Render drop celebration design. When your export finally finishes.', 599, 899, 'CRE-004', 'https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop"]'::jsonb, 55, true, true, 'active', 't-shirt', '["creator","render"]'),
('c0000000-0000-0000-0000-000000000008', 'Creator Archive Tee', 'creator-archive-tee', 'Archived content forever', 'Archive design for creators who document everything. Limited edition print.', 649, 949, 'CRE-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 50, true, false, 'active', 't-shirt', '["creator","archive"]'),

-- Cyberpunk (5)
('c0000000-0000-0000-0000-000000000009', 'Wireframe Echo Jacket', 'wireframe-echo-jacket', 'Neon-less futuristic bomber', 'Wireframe echo design on performance bomber jacket. Techwear meets minimal fashion.', 1999, 2999, 'CYB-001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"]'::jsonb, 20, true, true, 'active', 'jacket', '["cyberpunk","wireframe"]'),
('c0000000-0000-0000-0000-000000000009', 'Neonless Future Tee', 'neonless-future-tee', 'Future without the glow', 'Neonless future design stripping cyberpunk to its monochrome core.', 649, 949, 'CYB-002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 60, true, true, 'active', 't-shirt', '["cyberpunk","future"]'),
('c0000000-0000-0000-0000-000000000009', 'Machine Silence Hoodie', 'machine-silence-hoodie', 'When the machines go quiet', 'Machine silence design on premium fleece. The calm after the AI revolution.', 1399, 1999, 'CYB-003', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 35, true, false, 'active', 'hoodie', '["cyberpunk","machine"]'),
('c0000000-0000-0000-0000-000000000009', 'Dark Grid Tee', 'dark-grid-tee', 'Grid matrix visualization', 'Dark grid matrix pattern on premium cotton. The infrastructure beneath everything.', 599, 899, 'CYB-004', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 70, true, false, 'active', 't-shirt', '["cyberpunk","grid"]'),
('c0000000-0000-0000-0000-000000000009', 'Signal Construct Tee', 'signal-construct-tee', 'Built from pure signal', 'Signal construction design where digital meets physical. Premium heavyweight cotton.', 699, 999, 'CYB-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 50, true, true, 'active', 't-shirt', '["cyberpunk","signal"]'),

-- Vintage Web (5)
('c0000000-0000-0000-0000-000000000010', 'Netscape Memory Tee', 'netscape-memory-tee', '90s browser nostalgia', 'Netscape-era browser chrome design. Pure internet nostalgia on premium cotton.', 549, 799, 'VIN-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb, 75, true, true, 'active', 't-shirt', '["vintage","browser"]'),
('c0000000-0000-0000-0000-000000000010', 'Archive Buffer Hoodie', 'archive-buffer-hoodie', 'Loading buffer comfort', 'Loading buffer bar animation on cozy fleece. Nostalgic comfort for the modern web.', 1249, 1799, 'VIN-002', 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb, 45, true, false, 'active', 'hoodie', '["vintage","buffer"]'),
('c0000000-0000-0000-0000-000000000010', 'Pixel Relic Tee', 'pixel-relic-tee', 'Pixel art artifact', 'Pixel relic design celebrating the low-res roots of digital culture.', 499, 749, 'VIN-003', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1503341455253-b2e723bb3db1?w=400&h=400&fit=crop"]'::jsonb, 60, true, false, 'active', 't-shirt', '["vintage","pixel"]'),
('c0000000-0000-0000-0000-000000000010', 'Lost Domain Jacket', 'lost-domain-jacket', 'Domain expired outerwear', 'Lost domain 404 design on premium bomber jacket. The internet remembers nothing.', 1699, 2499, 'VIN-004', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"]'::jsonb, 25, true, true, 'active', 'jacket', '["vintage","domain"]'),
('c0000000-0000-0000-0000-000000000010', '404 Cache Tee', 'cache-tee', 'Cache cleared', 'Cache miss design with vintage HTML aesthetics. Classic web development humor.', 579, 849, 'VIN-005', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=400&fit=crop"]'::jsonb, 55, true, true, 'active', 't-shirt', '["vintage","cache"]')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 26. SEED DATA - SAMPLE COUPON (for testing)
-- ============================================================================
INSERT INTO coupons (code, type, value, min_order_amount, max_uses, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 500, 1000, true),
  ('FLAT100', 'fixed', 100, 1000, 500, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 27. RELOAD SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';
