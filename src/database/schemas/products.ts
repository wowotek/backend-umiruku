import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";


// ======================= Product =======================
export type TProduct = InferSelectModel<typeof product>;
export const product = mysqlTable('product', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull()
});

export type TProductPrice = InferSelectModel<typeof productPrice>;
export type TFullProductPrice = { product: TProduct | null, product_price: TProductPrice | null };
export const productPrice = mysqlTable('product_price', {
    id: int().autoincrement().primaryKey(),
    product_id: int().references(() => product.id),
    price: int().notNull(), // Rupiah * 1000
    date: datetime().notNull()
});

export const productPriceRelations = relations(productPrice, ({ one }) => ({
    product: one(product, { fields: [productPrice.product_id], references: [product.id] }),
}));

export type TDeliveryPlan = InferSelectModel<typeof deliveryPlan>;
export const deliveryPlan = mysqlTable('delivery_plan', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull()
});