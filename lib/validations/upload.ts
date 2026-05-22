import { z } from 'zod'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => ALLOWED_IMAGE_TYPES.includes(f.type as any), 'Only JPG, PNG, WebP, GIF allowed')
    .refine(f => f.size <= MAX_FILE_SIZE, 'Max file size is 5MB'),
  folder: z.string().default('404notfound/products'),
})

export const batchUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1).max(10),
  folder: z.string().default('404notfound/products'),
})

export type FileUploadInput = z.infer<typeof fileUploadSchema>
