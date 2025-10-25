import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const deliveryChannelEnum = pgEnum('delivery_channel', [
  'EMAIL',
  'CRM_WEBHOOK',
  'STAFF_TELEGRAM',
]);
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'PENDING',
  'SUCCESS',
  'FAILED',
  'GAVE_UP',
]);

export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  preferredClass: varchar('preferred_class', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const deliveries = pgTable('deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  inquiryId: uuid('inquiry_id')
    .references(() => inquiries.id)
    .notNull(),
  channel: deliveryChannelEnum('channel').notNull(),
  status: deliveryStatusEnum('status').default('PENDING').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  lastError: text('last_error'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pricing = pgTable('pricing', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  isActive: integer('is_active').default(1).notNull(), // 1 = active, 0 = inactive
});

export const timetable = pgTable('timetable', {
  id: uuid('id').primaryKey().defaultRandom(),
  day: varchar('day', { length: 20 }).notNull(), // Monday, Tuesday, etc.
  className: varchar('class_name', { length: 255 }).notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 10 }).notNull(), // HH:MM format
  instructor: varchar('instructor', { length: 255 }),
  capacity: integer('capacity').default(20),
  isActive: integer('is_active').default(1).notNull(),
});

export const ptPackages = pgTable('pt_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sessions: integer('sessions').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  duration: varchar('duration', { length: 100 }), // e.g., "60 minutes per session"
  isActive: integer('is_active').default(1).notNull(),
});

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  isActive: integer('is_active').default(1).notNull(),
});

// Relations
export const inquiriesRelations = relations(inquiries, ({ many }) => ({
  deliveries: many(deliveries),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [deliveries.inquiryId],
    references: [inquiries.id],
  }),
}));

// Export types for TypeScript
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
export type Pricing = typeof pricing.$inferSelect;
export type NewPricing = typeof pricing.$inferInsert;
export type Timetable = typeof timetable.$inferSelect;
export type NewTimetable = typeof timetable.$inferInsert;
export type PtPackage = typeof ptPackages.$inferSelect;
export type NewPtPackage = typeof ptPackages.$inferInsert;
export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
