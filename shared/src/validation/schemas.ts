import { z } from 'zod';

export const currencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN', 'BRL', 'COP']);

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .transform(s => s.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .transform(s => s.replace(/\D/g, ''))
  .refine(digits => digits.length >= 7 && digits.length <= 15, {
    message: 'Phone number must have 7-15 digits',
  });

export const moneySchema = z.object({
  amount: z.number().nonnegative('Amount cannot be negative'),
  currency: currencyCodeSchema,
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
export type MoneyDTO = z.infer<typeof moneySchema>;
export type AddressDTO = z.infer<typeof addressSchema>;
export type PaginationDTO = z.infer<typeof paginationSchema>;
