import { z } from 'zod'

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1).max(99),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
})

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(0).max(99),
})

export type CartItemInput = z.infer<typeof cartItemSchema>
export type CartUpdateInput = z.infer<typeof cartUpdateSchema>
