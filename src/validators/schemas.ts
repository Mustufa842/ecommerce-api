import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['user', 'admin']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// ─── Products ──────────────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().min(10).max(2000),
    price: z.number().positive('Price must be a positive number'),
    category: z.string().min(1).max(50),
    images: z.array(z.string().url('Each image must be a valid URL')).max(10).optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: z.number().positive().optional(),
    category: z.string().min(1).max(50).optional(),
    images: z.array(z.string().url()).max(10).optional(),
    stock: z.number().int().min(0).optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    category: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    sortBy: z.enum(['price', '-price', 'createdAt', '-createdAt']).optional(),
    search: z.string().optional(),
  }),
});

// ─── Orders ────────────────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Product ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must have at least one item'),
    shippingAddress: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
    }),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  }),
});

// ─── Payment ───────────────────────────────────────────────────────────────────
export const paymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    paymentMethod: z.enum(['credit_card', 'paypal', 'stripe']),
    cardDetails: z
      .object({
        cardNumber: z.string().length(16, 'Card number must be 16 digits'),
        expiryMonth: z.number().int().min(1).max(12),
        expiryYear: z.number().int().min(new Date().getFullYear()),
        cvv: z.string().min(3).max(4),
      })
      .optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];