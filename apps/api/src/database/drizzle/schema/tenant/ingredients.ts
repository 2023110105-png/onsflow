import {
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core';
import { products } from './products';

// CRITICAL FOR F&B: Raw ingredients (bahan baku)
export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  unit: text('unit').notNull(), // 'g', 'ml', 'pcs', 'kg', 'L'
  costPerUnit: decimal('cost_per_unit', {
    precision: 10,
    scale: 2,
  }).notNull(), // Harga beli per unit
  minStockLevel: decimal('min_stock_level', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  supplier: text('supplier'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Stock per outlet
export const ingredientStock = pgTable('ingredient_stock', {
  id: serial('id').primaryKey(),
  ingredientId: serial('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  outletId: serial('outlet_id').notNull(),
  quantity: decimal('quantity', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  lastRestockedAt: timestamp('restocked_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// CRITICAL FOR F&B: Recipe/BOM (Bill of Materials)
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  productId: serial('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  ingredientId: serial('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(), // Amount of ingredient needed
  unit: text('unit').notNull(), // 'g', 'ml', 'pcs'
  isOptional: boolean('is_optional').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Inventory movements (histori keluar-masuk bahan baku)
export const inventoryMovements = pgTable('inventory_movements', {
  id: serial('id').primaryKey(),
  ingredientId: serial('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  outletId: serial('outlet_id').notNull(),
  type: text('type').notNull(), // 'in', 'out', 'adjustment', 'waste'
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  referenceType: text('reference_type'), // 'order', 'restock', 'waste', 'opname'
  referenceId: serial('reference_id'), // ID of related record
  notes: text('notes'),
  createdBy: serial('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Waste tracking
export const wasteLogs = pgTable('waste_logs', {
  id: serial('id').primaryKey(),
  ingredientId: serial('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  outletId: serial('outlet_id').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  wasteType: text('waste_type').notNull(), // 'expired', 'spill', 'prep', 'overcooked', 'other'
  costValue: decimal('cost_value', { precision: 10, scale: 2 }).notNull(),
  recordedBy: serial('recorded_by'),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').notNull().defaultNow(),
});

// Stock take (opname)
export const stockTakes = pgTable('stock_takes', {
  id: serial('id').primaryKey(),
  outletId: serial('outlet_id').notNull(),
  status: text('status').notNull().default('draft'), // 'draft', 'in_progress', 'completed'
  startedBy: serial('started_by'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
});

export const stockTakeItems = pgTable('stock_take_items', {
  id: serial('id').primaryKey(),
  stockTakeId: serial('stock_take_id')
    .notNull()
    .references(() => stockTakes.id, { onDelete: 'cascade' }),
  ingredientId: serial('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  systemQuantity: decimal('system_quantity', {
    precision: 10,
    scale: 2,
  }).notNull(), // Stok teoritis
  actualQuantity: decimal('actual_quantity', {
    precision: 10,
    scale: 2,
  }).notNull(), // Stok fisik
  difference: decimal('difference', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
});
