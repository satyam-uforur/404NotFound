-- 404NotFound E-Commerce Platform - Seed Data
-- Prices in INR, aligned with 01-schema.sql

-- ============================================================================
-- INSERT CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, slug, description, display_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'T-Shirts', 't-shirts', 'Premium quality t-shirts for developers and tech enthusiasts', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Hoodies', 'hoodies', 'Comfortable hoodies with tech designs', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Mugs', 'mugs', 'Coffee mugs with coding humor', 3),
  ('a0000000-0000-0000-0000-000000000004', 'Stickers', 'stickers', 'Vinyl stickers for laptops and devices', 4),
  ('a0000000-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Tech accessories like phone stands and cables', 5)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT PRODUCTS
-- ============================================================================
INSERT INTO products (id, category_id, name, slug, description, long_description, price, mrp, sku, image_url, images, stock, is_active, featured) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Error 404 T-Shirt',
    'error-404-tshirt',
    'Classic "Error 404" design for developers',
    'Premium cotton t-shirt with minimalist Error 404 design. Available in multiple sizes. Perfect for developers who appreciate tech humor.',
    399,
    599,
    'TS-001',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"]'::jsonb,
    50,
    TRUE,
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Code is Poetry T-Shirt',
    'code-is-poetry-tshirt',
    'For developers who see beauty in code',
    'Soft 100% cotton t-shirt with "Code is Poetry" design. Printed with water-based ink for comfort and durability.',
    399,
    599,
    'TS-002',
    'https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop',
    '["https://images.unsplash.com/photo-1516575334481-f410a11e6ca5?w=400&h=400&fit=crop"]'::jsonb,
    40,
    TRUE,
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'Debug Mode Hoodie',
    'debug-mode-hoodie',
    'Cozy hoodie with debug theme',
    'Premium quality hoodie with embroidered Debug Mode graphic. Perfect for late-night coding sessions.',
    899,
    1299,
    'HD-001',
    'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop',
    '["https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop"]'::jsonb,
    30,
    TRUE,
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000003',
    'Developer Fuel Mug',
    'developer-fuel-mug',
    'Coffee mug with programming humor',
    'Ceramic mug with "Developer Fuel" text. 11oz capacity. Dishwasher and microwave safe.',
    249,
    399,
    'MG-001',
    'https://images.unsplash.com/photo-1514432324607-2e467f4af387?w=400&h=400&fit=crop',
    '["https://images.unsplash.com/photo-1514432324607-2e467f4af387?w=400&h=400&fit=crop"]'::jsonb,
    100,
    TRUE,
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000004',
    'Git Commit Sticker Pack',
    'git-commit-sticker-pack',
    'Pack of coding-themed vinyl stickers',
    'Set of 10 high-quality vinyl stickers with git and programming themes. Perfect for laptops and water bottles.',
    99,
    199,
    'ST-001',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop"]'::jsonb,
    200,
    TRUE,
    FALSE
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000005',
    'Laptop Stand',
    'laptop-stand',
    'Adjustable aluminum laptop stand',
    'Premium adjustable laptop stand made from aircraft-grade aluminum. Compatible with all laptops and tablets.',
    1499,
    2499,
    'AC-001',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"]'::jsonb,
    25,
    TRUE,
    FALSE
  )
ON CONFLICT DO NOTHING;
