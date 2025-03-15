import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";
import { customers } from "./customers";
import { deliveryPlan, product, productPrice } from "./products";
import { files } from "./files";


// === Types Definition
export type TInvoiceItems = InferSelectModel<typeof invoiceItems>;
export type TInvoice = InferSelectModel<typeof invoice>;
export type TCustomerSubscription = InferSelectModel<typeof customerSubscription>;


// === Table Definitions
export const tblDefInvoiceItems = {
    id: int().autoincrement().primaryKey(),
    invoice_id: int().notNull().references(() => invoice.id),
    product_id: int().notNull().references(() => product.id, { onDelete: 'no action' }),
    product_name: text().notNull(),
    product_price: int().notNull(),
    description: text().notNull().default(""),
    quantity: int().notNull().default(1),
};
export const tblDefInvoice = {
    id: int().autoincrement().primaryKey(),
    order_id: varchar({ length: 256 }).notNull().unique(),
    customer_id: int().notNull().references(() => customers.id),
    date: datetime().notNull(),
    
    total: int().notNull(), // Rupiah * 1000
    method: varchar({ length: 255, enum: ['transfer'] }).notNull(),
    status: varchar({ length: 255, enum: ['pending', 'issued', 'success', 'failed', "cancelled"] }).notNull(),
    bukti_transfer_file_id: int().references(() => files.id),
};
export const tblDefCustomerSubscription = {
    id: int().autoincrement().primaryKey(),
    customer_id: int().references(() => customers.id),
    product_id: int().references(() => product.id),
    delivery_plan_id: int().references(() => deliveryPlan.id),
    start_date: datetime().notNull().$defaultFn(() => new Date()),
    end_date: datetime().notNull(),
    status: varchar({ length: 255, enum: ['active', 'fulfilled', 'underperform', 'cancelled'] }).notNull()
};

// === Table Instances
export const invoiceItems = mysqlTable('invoice_items', tblDefInvoiceItems);
export const invoice = mysqlTable('invoice', tblDefInvoice);
export const customerSubscription = mysqlTable('customer_subscription', tblDefCustomerSubscription);


// === Relations
export const invoiceRelations = relations(invoice, ({ one }) => ({
    customer: one(customers, { fields: [invoice.customer_id], references: [customers.id] }),
    bukti_transfer_file: one(files, { fields: [invoice.bukti_transfer_file_id], references: [files.id] }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoice, { fields: [invoiceItems.invoice_id], references: [invoice.id] })
}));