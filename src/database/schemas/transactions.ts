import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";
import { customers } from "./customers";
import { deliveryPlan, product, productPrice } from "./products";
import { files } from "./files";

export type TInvoiceItems = InferSelectModel<typeof invoiceItems>;
export const invoiceItems = mysqlTable('invoice_items', {
    id: int().autoincrement().primaryKey(),
    invoice_id: int().references(() => invoice.id),
    product_name: text().notNull(),
    product_price: int().notNull(),
    quantity: int().notNull().default(1),
});

export type TInvoice = InferSelectModel<typeof invoice>;
export const invoice = mysqlTable('invoice', {
    id: int().autoincrement().primaryKey(),
    customer_id: int().notNull().references(() => customers.id),
    date: datetime().notNull(),

    total: int().notNull(), // Rupiah * 1000
    method: varchar({ length: 255, enum: ['transfer'] }).notNull(),
    status: varchar({ length: 255, enum: ['pending', 'issued', 'success', 'failed', "cancelled"] }).notNull(),
    bukti_transfer_file_id: int().references(() => files.id),
});

export const invoiceRelations = relations(invoice, ({ one }) => ({
    customer: one(customers, { fields: [invoice.customer_id], references: [customers.id] }),
    bukti_transfer_file: one(files, { fields: [invoice.bukti_transfer_file_id], references: [files.id] }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoice, { fields: [invoiceItems.invoice_id], references: [invoice.id] })
}));

export type TCustomerSubscription = InferSelectModel<typeof customer_subscription>;
export const customer_subscription = mysqlTable('customer_subscription', {
    id: int().autoincrement().primaryKey(),
    customer_id: int().references(() => customers.id),
    product_id: int().references(() => product.id),
    delivery_plan_id: int().references(() => deliveryPlan.id),
    start_date: datetime().notNull(),
    end_date: datetime().notNull(),
    status: varchar({ length: 255, enum: ['active', 'fulfilled', 'underperform', 'cancelled'] }).notNull()
});