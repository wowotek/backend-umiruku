import { relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";

// ======================= FILES =======================
export type TFile = {
    id: number,
    filename_path: string,
    mimetype: string,
    signature: string,
};
export const files = mysqlTable('files', {
    id: int().autoincrement().primaryKey(),
    filename_path: text().notNull(),
    mimetype: text().notNull(),
    signature: varchar({ length: 255 }).notNull(),
});
// =====================================================