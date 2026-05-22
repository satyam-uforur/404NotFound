import { z } from 'zod'

export const ORDER_STATUSES = ['pending', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export const orderCreateSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().optional().nullable(),
    product_name: z.string(),
    product_sku: z.string().optional().nullable(),
    quantity: z.number().int().min(1),
    price_per_unit: z.coerce.number().min(0),
    total_price: z.coerce.number().min(0),
    size: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  })).min(1, 'Order must contain at least one item'),
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid().optional().nullable(),
  subtotal: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  couponCode: z.string().optional().nullable(),
  totalAmount: z.coerce.number().min(0),
})

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  tracking_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>
