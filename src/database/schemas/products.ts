import { relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";


// ======================= Product =======================
export const product = mysqlTable('product', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull()
});

export const productPrice = mysqlTable('product_price', {
    id: int().autoincrement().primaryKey(),
    product_id: int().references(() => product.id),
    price: int().notNull(), // Rupiah * 1000
    date: datetime().notNull()
});

export const productPriceRelations = relations(productPrice, ({ one }) => ({
    product: one(product, { fields: [productPrice.product_id], references: [product.id] }),
}));

export const deliveryPlan = mysqlTable('delivery_plan', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    is_enabled: boolean().notNull()
});