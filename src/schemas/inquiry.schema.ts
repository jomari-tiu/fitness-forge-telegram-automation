import { z } from 'zod';

// Main inquiry creation schema
export const createInquirySchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long')
    .regex(
      /^[a-zA-Z\s\-'.]+$/,
      'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
    ),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(50, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),

  email: z.string().email('Invalid email format').max(255, 'Email is too long'),

  preferredClass: z
    .string()
    .min(1, 'Please specify preferred class')
    .max(255, 'Preferred class description is too long'),
});

// CRM webhook payload schema
export const crmWebhookSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  preferredClass: z.string().optional(),
});

// Email notification schema
export const emailNotificationSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  preferredClass: z.string(),
});

// Telegram staff notification schema
export const telegramStaffNotificationSchema = z.object({
  chatId: z.string(),
  message: z.string(),
});

// Delivery retry schema
export const deliveryRetrySchema = z.object({
  deliveryId: z.string().uuid(),
  channel: z.enum(['EMAIL', 'CRM_WEBHOOK', 'STAFF_TELEGRAM']),
  attempts: z.number().min(0).max(4),
});

// Content schemas for gym data
export const pricingSchema = z.object({
  title: z.string().min(1).max(255),
  price: z.string().regex(/^\d+(\.\d{2})?$/, 'Price must be in format 0.00'),
  description: z.string().min(1),
  isActive: z.number().min(0).max(1).default(1),
});

export const timetableSchema = z.object({
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  className: z.string().min(1).max(255),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  endTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  instructor: z.string().max(255).optional(),
  capacity: z.number().min(1).default(20),
  isActive: z.number().min(0).max(1).default(1),
});

export const ptPackageSchema = z.object({
  name: z.string().min(1).max(255),
  sessions: z.number().min(1),
  price: z.string().regex(/^\d+(\.\d{2})?$/, 'Price must be in format 0.00'),
  description: z.string().min(1),
  duration: z.string().max(100).optional(),
  isActive: z.number().min(0).max(1).default(1),
});

export const promotionSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  validUntil: z.date(),
  isActive: z.number().min(0).max(1).default(1),
});

// Type exports
export type CreateInquiryDto = z.infer<typeof createInquirySchema>;
export type CrmWebhookDto = z.infer<typeof crmWebhookSchema>;
export type EmailNotificationDto = z.infer<typeof emailNotificationSchema>;
export type TelegramStaffNotificationDto = z.infer<
  typeof telegramStaffNotificationSchema
>;
export type DeliveryRetryDto = z.infer<typeof deliveryRetrySchema>;
export type PricingDto = z.infer<typeof pricingSchema>;
export type TimetableDto = z.infer<typeof timetableSchema>;
export type PtPackageDto = z.infer<typeof ptPackageSchema>;
export type PromotionDto = z.infer<typeof promotionSchema>;
