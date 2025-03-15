import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";
import { customers } from "./customers";

export type TUser = InferSelectModel<typeof users>;
export type TUserProtected = Omit<TUser, 'password'> & { password?: string };

export type TSession = InferSelectModel<typeof sessions>;


export const tblDefUser = {
           id: int().autoincrement().primaryKey(),
    user_type: varchar({ length: 64, enum: ['ADMIN', 'CUSTOMER'] }).notNull(),
     username: varchar({ length: 255 }).notNull().unique(),
     password: varchar({ length: 512 }).notNull().unique(),
};
export const tblDefSession = {
             id: int().autoincrement().primaryKey(),
        user_id: int().references(() => users.id),
      user_type: varchar({ length: 64, enum: ['ADMIN', 'CUSTOMER'] }).notNull(),
       username: varchar({ length: 255 }).notNull(),
    customer_id: int().references(() => customers.id),
          token: varchar({ length: 512 }).notNull().unique(),
        created: datetime().notNull(),
         expiry: datetime().notNull(),
      is_active: boolean().notNull().default(true),
}


export const users = mysqlTable('users', tblDefUser);
export const sessions = mysqlTable('sessions', tblDefSession);