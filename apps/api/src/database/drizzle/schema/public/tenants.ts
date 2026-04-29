import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  planId: serial('plan_id').references(() => plans.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price').notNull(), // Store as string to handle IDR format
  features: text('features').array().notNull(), // Array of feature strings
  maxOutlets: serial('max_outlets').notNull().default(1),
  maxUsers: serial('max_users').notNull().default(5),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  tenantId: serial('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  planId: serial('plan_id')
    .notNull()
    .references(() => plans.id),
  status: text('status').notNull(), // 'active', 'expired', 'cancelled', 'trial'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
