import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { kelurahan, kecamatan, kabupaten, provinsi, kodepos } from "./addresses";


export type TCustomer = InferSelectModel<typeof customers>;
export const customers = mysqlTable('customer', {
    id: int().autoincrement().primaryKey(),
    user_id: int().unique().references(() => users.id),
    
    fullname    : varchar({ length: 512 }).notNull(),
    phone_number: varchar({ length: 16 }).notNull().unique(),

    kelurahan_id: int().notNull().references(() => kelurahan.id),
    kecamatan_id: int().notNull().references(() => kecamatan.id),
    kabupaten_id: int().notNull().references(() => kabupaten.id),
    provinsi_id : int().notNull().references(() => provinsi.id),
    kodepos_id  : int().notNull().references(() => kodepos.id),

    full_address: text().notNull(),

    coord_lati: decimal({ precision: 11, scale: 8 }).notNull(),
    coord_long: decimal({ precision: 11, scale: 8 }).notNull(),
});

export const customerRelations = relations(customers, ({ one }) => ({
    user: one(users, { fields: [customers.user_id], references: [users.id] }),
    kelurahan: one(kelurahan, { fields: [customers.kelurahan_id], references: [kelurahan.id] }),
    kecamatan: one(kecamatan, { fields: [customers.kecamatan_id], references: [kecamatan.id] }),
    kabupaten: one(kabupaten, { fields: [customers.kabupaten_id], references: [kabupaten.id] }),
     provinsi: one(provinsi, { fields: [customers.provinsi_id], references: [provinsi.id] }),
      kodepos: one(kodepos, { fields: [customers.kodepos_id], references: [kodepos.id] }),
}));