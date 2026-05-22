import { z } from 'zod'

export const reviewCreateSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
  images: z.array(z.string().url()).max(5).default([]),
})

export const reviewUpdateSchema = z.object({
  is_approved: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
})

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>
