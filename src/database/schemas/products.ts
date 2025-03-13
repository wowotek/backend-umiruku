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
    name: varchar({ length: 255 }).notNull()
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

// === Relations
export const productPriceRelations = relations(productPrice, ({ one }) => ({
    product: one(product, { fields: [productPrice.product_id], references: [product.id] }),
}));