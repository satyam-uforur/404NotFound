import { z } from 'zod'

export const PRODUCT_TYPES = ['t-shirt', 'hoodie', 'cap', 'jacket', 'mug', 'sticker', 'accessory', 'phone-case', 'poster', 'notebook'] as const
export const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  mrp: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  weight: z.coerce.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().default(true),
})

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required').max(500),
  long_description: z.string().optional().nullable(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  mrp: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  category_id: z.string().uuid().optional().nullable(),
  collection_id: z.string().uuid().optional().nullable(),
  product_type: z.enum(PRODUCT_TYPES).default('t-shirt'),
  status: z.enum(PRODUCT_STATUSES).default('draft'),
  is_active: z.boolean().default(true),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  image_url: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  weight: z.coerce.number().min(0).optional().nullable(),
  dimensions: z.object({
    length: z.coerce.number().optional(),
    width: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
  }).optional().nullable(),
  meta_title: z.string().max(60).optional().nullable(),
  meta_description: z.string().max(160).optional().nullable(),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
  tax_percent: z.coerce.number().min(0).max(100).default(18),
})

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().uuid(),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
