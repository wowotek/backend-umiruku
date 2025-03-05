import { relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text } from "drizzle-orm/mysql-core";


export const provinsi = mysqlTable('provinsi', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }),
});

export const kabupaten = mysqlTable('kabupaten', {
    id: int().autoincrement().primaryKey(),
    provinsi_id: int().references(() => provinsi.id),
    name: varchar({ length: 255 }),
});

export const kabupatenRelations = relations(kabupaten, ({ one }) => ({
    provinsi: one(provinsi, { fields: [kabupaten.provinsi_id], references: [provinsi.id] }),
}));

export const kecamatan = mysqlTable('kecamatan', {
    id: int().autoincrement().primaryKey(),
    kabupaten_id: int().references(() => kabupaten.id),
    name: varchar({ length: 255 }),
});

export const kecamatanRelations = relations(kecamatan, ({ one }) => ({
    kabupaten: one(kabupaten, { fields: [kecamatan.kabupaten_id], references: [kabupaten.id] }),
}));

export const kelurahan = mysqlTable('kelurahan', {
    id: int().autoincrement().primaryKey(),
    kecamatan_id: int().references(() => kecamatan.id),
    name: varchar({ length: 255 }),
});

export const kelurahanRelations = relations(kelurahan, ({ one }) => ({
    kecamatan: one(kecamatan, { fields: [kelurahan.kecamatan_id], references: [kecamatan.id] }),
}));

export const kodepos = mysqlTable('kodepos', {
    id: int().autoincrement().primaryKey(),
    kelurahan_id: int().references(() => kelurahan.id),
    kodepos: varchar({ length: 5 }),
});

export const kodeposRelations = relations(kodepos, ({ one }) => ({
    kelurahan: one(kelurahan, { fields: [kodepos.kelurahan_id], references: [kelurahan.id] }),
}));


// ======================= FILES =======================
export const files = mysqlTable('files', {
    id: int().autoincrement().primaryKey(),
    filename_path: text().notNull(),
    mimetype: text().notNull(),
    signature: varchar({ length: 255 }).notNull(),
});
// =====================================================


export const users = mysqlTable('users', {
    id: int().autoincrement().primaryKey(),
    username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 512 }).notNull().unique(),
});

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

export const pembayaran = mysqlTable('pembayaran', {
    id: int().autoincrement().primaryKey(),
    customer_id: int().references(() => customers.id),
    total: decimal({ precision: 15, scale: 2 }),
    status: varchar({ length: 255, enum: ['pending', 'success', 'failed', "cancelled"] }),
    date: datetime(),
    method: varchar({ length: 255, enum: ['transfer'] }),
    bukti_transfer_file_id: int().references(() => files.id),
});

export const customerRelations = relations(customers, ({ one }) => ({
    user: one(users, { fields: [customers.user_id], references: [users.id] }),
    kelurahan: one(kelurahan, { fields: [customers.kelurahan_id], references: [kelurahan.id] }),
    kecamatan: one(kecamatan, { fields: [customers.kecamatan_id], references: [kecamatan.id] }),
    kabupaten: one(kabupaten, { fields: [customers.kabupaten_id], references: [kabupaten.id] }),
     provinsi: one(provinsi, { fields: [customers.provinsi_id], references: [provinsi.id] }),
      kodepos: one(kodepos, { fields: [customers.kodepos_id], references: [kodepos.id] }),
}));

