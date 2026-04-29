import {
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
import { products } from './products';
import { users } from './users';
import { tables } from './users';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  outletId: serial('outlet_id').notNull(),
  tableId: serial('table_id').references(() => tables.id),
  orderType: text('order_type').notNull(), // 'dine_in', 'takeaway', 'delivery', 'ojol'
  status: text('status').notNull().default('pending'), // 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'
  subtotal: decimal('subtotal', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  tax: decimal('tax', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  discount: decimal('discount', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  serviceCharge: decimal('service_charge', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  total: decimal('total', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  notes: text('notes'),
  customerId: serial('customer_id'),
  createdBy: serial('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: serial('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: serial('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  totalPrice: decimal('total_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const orderItemModifiers = pgTable('order_item_modifiers', {
  id: serial('id').primaryKey(),
  orderItemId: serial('order_item_id')
    .notNull()
    .references(() => orderItems.id, { onDelete: 'cascade' }),
  modifierOptionId: serial('modifier_option_id').notNull(),
  priceAdjustment: decimal('price_adjustment', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  transactionNumber: text('transaction_number').notNull().unique(),
  orderId: serial('order_id').references(() => orders.id),
  outletId: serial('outlet_id').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'cash', 'qris', 'card', 'e_wallet', 'transfer'
  amount: decimal('amount', {
    precision: 10,
    scale: 2,
  }).notNull(),
  change: decimal('change', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  status: text('status').notNull().default('completed'), // 'pending', 'completed', 'refunded', 'cancelled'
  referenceNumber: text('reference_number'), // For QRIS, card, etc.
  notes: text('notes'),
  processedBy: serial('processed_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
  id: serial('id').primaryKey(),
  transactionId: serial('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  orderItemId: serial('order_item_id').references(() => orderItems.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  totalPrice: decimal('total_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
});

// Shift & Cash Drawer Management (KRITIS)
export const shifts = pgTable('shifts', {
  id: serial('id').primaryKey(),
  outletId: serial('outlet_id').notNull(),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  openedAt: timestamp('opened_at').notNull().defaultNow(),
  closedAt: timestamp('closed_at'),
  openingCash: decimal('opening_cash', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  expectedCash: decimal('expected_cash', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  actualCash: decimal('actual_cash', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  difference: decimal('difference', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0'),
  notes: text('notes'),
  status: text('status').notNull().default('open'), // 'open', 'closed'
});

export const shiftCashMovements = pgTable('shift_cash_movements', {
  id: serial('id').primaryKey(),
  shiftId: serial('shift_id')
    .notNull()
    .references(() => shifts.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'opening', 'petty_cash_in', 'petty_cash_out', 'closing'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  approvedBy: serial('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Void & Refund Approval Workflow
export const voidRequests = pgTable('void_requests', {
  id: serial('id').primaryKey(),
  transactionId: serial('transaction_id').references(() => transactions.id),
  orderItemId: serial('order_item_id').references(() => orderItems.id),
  requestedBy: serial('requested_by')
    .notNull()
    .references(() => users.id),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  approvedBy: serial('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
