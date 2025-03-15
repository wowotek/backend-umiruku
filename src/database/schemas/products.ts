import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";


// === Types Definition
export type TProduct = InferSelectModel<typeof product>;
export type TProductPrice = InferSelectModel<typeof productPrice>;
export type TFullProductPrice = { product: TProduct | null, product_price: TProductPrice | null };
export type TDeliveryPlan = InferSelectModel<typeof deliveryPlan>;

// === Table Definitions    
export const tblDefProduct = {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    is_deleted: boolean().default(false)
};
export const tblDefProductTransaction = {
    id: int().autoincrement().primaryKey(),
    product_id: int().references(() => product.id),
    unit_change: int().notNull()
};
export const tblDefProductPrice = {
    id: int().autoincrement().primaryKey(),
    product_id: int().references(() => product.id),
    price: int().notNull(), // Rupiah * 1000
    date: datetime().notNull()
};
export const tblDefDeliveryPlan = {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull()
};

// === Table Instances
export const product = mysqlTable('product', tblDefProduct);
export const productPrice = mysqlTable('product_price', tblDefProductPrice);
export const deliveryPlan = mysqlTable('delivery_plan', tblDefDeliveryPlan);
export const productTransaction = mysqlTable('product_transaction', tblDefProductTransaction);

// === Relations
export const productPriceRelations = relations(productPrice, ({ one }) => ({
    product: one(product, { fields: [productPrice.product_id], references: [product.id] }),
}));

export const productTransactionRelations = relations(productTransaction, ({ one }) => ({
    product: one(product, { fields: [productTransaction.product_id], references: [product.id] }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
    product_price: one(productPrice, { fields: [product.id], references: [productPrice.product_id] }),
    product_transaction: many(productTransaction)
}));