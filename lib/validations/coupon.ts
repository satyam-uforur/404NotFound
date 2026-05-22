import { z } from 'zod'

export const couponCreateSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_uses: z.number().int().min(1).optional().nullable(),
  starts_at: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  cart_total: z.coerce.number().min(0),
})

export type CouponCreateInput = z.infer<typeof couponCreateSchema>
export type CouponValidateInput = z.infer<typeof couponValidateSchema>
