import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";

export type TUser = InferSelectModel<typeof users>;
export type TUserProtected = Omit<TUser, 'password'> & { password?: string };
export const users = mysqlTable('users', {
    id: int().autoincrement().primaryKey(),
    user_type: varchar({ length: 64, enum: ['ADMIN', 'CUSTOMER'] }).notNull(),
    username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 512 }).notNull().unique(),
});