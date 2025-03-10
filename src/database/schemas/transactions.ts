import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";
import { customers } from "./customers";
import { deliveryPlan, product, productPrice } from "./products";
import { files } from "./files";

export type TInvoice = InferSelectModel<typeof invoice>;
export const invoice = mysqlTable('invoice', {
    id: int().autoincrement().primaryKey(),
    customer_id: int().references(() => customers.id),
    date: datetime(),
    
    product_price_id: int().references(() => productPrice.id),
    delivery_plan_id: int().references(() => deliveryPlan.id),

    total: int(), // Rupiah * 1000
    method: varchar({ length: 255, enum: ['transfer'] }),
    status: varchar({ length: 255, enum: ['pending', 'success', 'failed', "cancelled"] }),
    bukti_transfer_file_id: int().references(() => files.id),
});

// TODO: make both relation for invoice -> customer and customer -> invoice
// TODO: make both relation for invoice -> productPrice and productPrice -> invoice
// TODO: make both relation for invoice -> deliveryPlan and deliveryPlan -> invoice

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