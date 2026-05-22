import { z } from 'zod'

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().optional().default(''),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  display_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string().uuid(),
})

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
