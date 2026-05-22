import { z } from 'zod'

export const addressCreateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(10, 'Valid phone required').max(15),
  email: z.string().email('Valid email required'),
  street_address: z.string().min(1, 'Address is required').max(300),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postal_code: z.string().min(5, 'Valid pincode required').max(10),
  country: z.string().default('India'),
  type: z.enum(['shipping', 'billing']).default('shipping'),
  is_default: z.boolean().default(false),
})

export type AddressCreateInput = z.infer<typeof addressCreateSchema>
