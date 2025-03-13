import { InferSelectModel, relations } from "drizzle-orm";
import { int, varchar, decimal, mysqlTable, datetime, text, boolean } from "drizzle-orm/mysql-core";


// === Types Definition
export type TProvinsi = InferSelectModel<typeof provinsi>;
export type TKabupaten = InferSelectModel<typeof kabupaten>;
export type TKecamatan = InferSelectModel<typeof kecamatan>;
export type TKelurahan = InferSelectModel<typeof kelurahan>;
export type TKodepos = InferSelectModel<typeof kodepos>;
export type TEnabledKecamatan = InferSelectModel<typeof enabledKecamatan>;

// === Table Definitions
export const tblDefProvinsi = {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
};

export const tblDefKabupaten = {
    id: int().autoincrement().primaryKey(),
    provinsi_id: int().notNull().references(() => provinsi.id),
    name: varchar({ length: 255 }).notNull(),
};

export const tblDefKecamatan = {
    id: int().autoincrement().primaryKey(),
    kabupaten_id: int().notNull().references(() => kabupaten.id),
    name: varchar({ length: 255 }).notNull(),
};

export const tblDefKelurahan = {
    id: int().autoincrement().primaryKey(),
    kecamatan_id: int().notNull().references(() => kecamatan.id),
    name: varchar({ length: 255 }).notNull(),
};

export const tblDefKodepos = {
    id: int().autoincrement().primaryKey(),
    kelurahan_id: int().notNull().references(() => kelurahan.id),
    kodepos: varchar({ length: 5 }).notNull(),
};

export const tblDefEnabledKecamatan = {
    id: int().autoincrement().primaryKey(),
    kecamatan_id: int().unique().notNull().references(() => kecamatan.id),
};


// === Table Instances
export const provinsi = mysqlTable('provinsi', tblDefProvinsi);
export const kabupaten = mysqlTable('kabupaten', tblDefKabupaten);
export const kecamatan = mysqlTable('kecamatan', tblDefKecamatan);
export const kelurahan = mysqlTable('kelurahan', tblDefKelurahan);
export const kodepos = mysqlTable('kodepos', tblDefKodepos);
export const enabledKecamatan = mysqlTable('enabled_kecamatan', tblDefEnabledKecamatan);


// === RELATIONS
export const provinsiToKabupaten = relations(provinsi, ({ many }) => ({
    to_kabupaten: many(kabupaten),
}));

export const kabupatenRelations = relations(kabupaten, ({ one, many }) => ({
    to_provinsi: one(provinsi, { fields: [kabupaten.provinsi_id], references: [provinsi.id] }),
    to_kecamatan: many(kecamatan),
}));

export const kecamatanRelations = relations(kecamatan, ({ one, many }) => ({
    to_kabupaten: one(kabupaten, { fields: [kecamatan.kabupaten_id], references: [kabupaten.id] }),
    to_kelurahan: many(kelurahan),
    to_enabled_kecamatan: one(enabledKecamatan, { fields: [kecamatan.id], references: [enabledKecamatan.kecamatan_id] }),
}));

export const kelurahanRelations = relations(kelurahan, ({ one, many }) => ({
    to_kecamatan: one(kecamatan, { fields: [kelurahan.kecamatan_id], references: [kecamatan.id] }),
    to_kodepos: many(kodepos),
}));

export const kodeposRelations = relations(kodepos, ({ one }) => ({
    kelurahan: one(kelurahan, { fields: [kodepos.kelurahan_id], references: [kelurahan.id] }),
}));

export const enabledKecamatanRelations = relations(enabledKecamatan, ({ one }) => ({
    kecamatan: one(kecamatan, { fields: [enabledKecamatan.kecamatan_id], references: [kecamatan.id] }),
}));