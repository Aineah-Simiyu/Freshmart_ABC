import { z } from 'zod';

export const createSaleSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
