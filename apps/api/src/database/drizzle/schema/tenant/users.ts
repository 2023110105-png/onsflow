import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull(), // 'owner', 'manager', 'supervisor', 'cashir', 'barista'
  outletId: serial('outlet_id'), // For staff assigned to specific outlet
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const outlets = pgTable('outlets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  isOpen: boolean('is_open').notNull().default(true),
  timezone: text('timezone').notNull().default('Asia/Jakarta'),
  settings: jsonb('settings'), // Store outlet-specific settings
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  outletId: serial('outlet_id')
    .notNull()
    .references(() => outlets.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  capacity: serial('capacity').notNull().default(4),
  status: text('status').notNull().default('available'), // 'available', 'occupied', 'reserved', 'cleaning'
  qrCode: text('qr_code'), // QR code for self-ordering
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
