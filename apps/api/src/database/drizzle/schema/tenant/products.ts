import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
import { outlets } from './users';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: serial('category_id').references(() => categories.id),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  isAvailable: boolean('is_available').notNull().default(true),
  preparationTime: integer('preparation_time'), // in minutes
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// CRITICAL FOR F&B: Modifier groups per product
export const modifierGroups = pgTable('modifier_groups', {
  id: serial('id').primaryKey(),
  productId: serial('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Ukuran", "Jenis Susu", "Level Gula"
  required: boolean('required').notNull().default(false),
  minSelect: integer('min_select').notNull().default(1),
  maxSelect: integer('max_select').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// CRITICAL FOR F&B: Modifier options within groups
export const modifierOptions = pgTable('modifier_options', {
  id: serial('id').primaryKey(),
  modifierGroupId: serial('modifier_group_id')
    .notNull()
    .references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Regular", "Large", "Oat Milk", "Soya"
  priceAdjustment: decimal('price_adjustment', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  isDefault: boolean('is_default').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Combo/Bundle builder
export const combos = pgTable('combos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const comboItems = pgTable('combo_items', {
  id: serial('id').primaryKey(),
  comboId: serial('combo_id')
    .notNull()
    .references(() => combos.id, { onDelete: 'cascade' }),
  productId: serial('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  modifierOptions: text('modifier_options'), // JSON string of selected modifiers
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Dynamic pricing rules
export const priceRules = pgTable('price_rules', {
  id: serial('id').primaryKey(),
  productId: serial('product_id').references(() => products.id),
  outletId: serial('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  ruleType: text('rule_type').notNull(), // 'time_based', 'day_based', 'date_range'
  startTime: text('start_time'), // HH:mm format
  endTime: text('end_time'), // HH:mm format
  daysOfWeek: text('days_of_week').array(), // [1,2,3,4,5,6,7] bitmask
  discountType: text('discount_type').notNull(), // 'percentage', 'fixed', 'override'
  discountValue: decimal('discount_value', {
    precision: 10,
    scale: 2,
  }).notNull(),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
