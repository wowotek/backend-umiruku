import { eq } from 'drizzle-orm';
import DBController from '../database';
import Schema from "../database/schemas";
import { kecamatan, TKabupaten, TKecamatan, TKelurahan, TKodepos, TProvinsi } from "../database/schemas/addresses";

export const addEnabledKecamatan = async (
        kecamatan_id: number
    ) => await DBController.select()
        .from(Schema.addresses.kecamatan)
        .where(
            eq(Schema.addresses.kecamatan.id, kecamatan_id)
        )
        .then(async results => {
            if (results.length === 0) return {
                status: 'error',
                result: 'kecamatan_not_found'
            };

            // check if enabled kecamatan already exist
            return await DBController.select()
                .from(Schema.addresses.enabledKecamatan)
                .where(
                    eq(Schema.addresses.enabledKecamatan.kecamatan_id, kecamatan_id)
                )
                .limit(1)
                .then(async results => {
                    if (results.length > 0) return {
                        status: 'error',
                        result: 'kecamatan_already_enabled'
                    };

                    return await DBController
                        .insert(Schema.addresses.enabledKecamatan)
                        .values({ kecamatan_id })
                        .$returningId()
                        .then(async ids => ({
                            status: 'ok',
                            result: ids.map(_id => _id.id)
                        }))
                        .catch(async (err: Error) => {
                            console.error("addEnabledKecamatan", err);
                            return {
                                status: 'error',
                                result: err
                            }
                        });
                })
                .catch(async (err: Error) => {
                    console.error("addEnabledKecamatan.getExistingEnabledKecamatan", err);
                    return {
                        status: 'error',
                        result: err
                    }
                })
        })
        .catch(async (err: Error) => {
            console.error("addEnabledKecamatan.getKecamatanExist", err);
            return {
                status: 'error',
                result: err
            }
        });

export const removeEnabledKecamatanByKecamatanId = async (
        kecamatan_id: number
    ) => await DBController
        .delete(Schema.addresses.enabledKecamatan)
        .where(
            eq(Schema.addresses.enabledKecamatan.kecamatan_id, kecamatan_id)
        )
        .then(async result => ({
            status: 'ok',
            result
        }))
        .catch(async (err: Error) => {
            console.error("removeEnabledKecamatanByKecamatanId", err);
            return {
                status: 'error',
                result: err
            }
        });

export const removeEnabledKecamatanById = async (
        id: number
    ) => await DBController
        .delete(Schema.addresses.enabledKecamatan)
        .where(
            eq(Schema.addresses.enabledKecamatan.id, id)
        )
        .then(async result => ({
            status: 'ok',
            result
        }))
        .catch(async (err: Error) => {
            console.error("removeEnabledKecamatanById", err);
            return {
                status: 'error',
                result: err
            }
        });

export const getAddressDetails = async (
        provinsi_id : number,
        kabupaten_id: number,
        kecamatan_id: number,
        kelurahan_id: number,
        kodepos_id: number,
    ) => {
        const provinsi: TProvinsi | null = await DBController.select()
            .from(Schema.addresses.provinsi)
            .where(
                eq(Schema.addresses.provinsi.id, provinsi_id)
            )
            .limit(1)
            .then(async results => results.length > 0 ? results[0] : null)
            .catch(async err => {
                console.error("getAddressDetails.provinsi", err);
                return null;
            });
        
        const kabupaten: TKabupaten | null = await DBController.select()
            .from(Schema.addresses.kabupaten)
            .where(
                eq(Schema.addresses.kabupaten.id, kabupaten_id)
            )
            .limit(1)
            .then(async results => results.length > 0 ? results[0] : null)
            .catch(async err => {
                console.error("getAddressDetails.kabupaten", err);
                return null;
            });
        
        const kecamatan: TKecamatan | null = await DBController.select()
            .from(Schema.addresses.kecamatan)
            .where(
                eq(Schema.addresses.kecamatan.id, kecamatan_id)
            )
            .limit(1)
            .then(async results => results.length > 0 ? results[0] : null)
            .catch(async err => {
                console.error("getAddressDetails.kecamatan", err);
                return null;
            });
        
        const kelurahan: TKelurahan | null = await DBController.select()
            .from(Schema.addresses.kelurahan)
            .where(
                eq(Schema.addresses.kelurahan.id, kelurahan_id)
            )
            .limit(1)
            .then(async results => results.length > 0 ? results[0] : null)
            .catch(async err => {
                console.error("getAddressDetails.kelurahan", err);
                return null;
            });
        
        const kodepos: TKodepos | null = await DBController.select()
            .from(Schema.addresses.kodepos)
            .where(
                eq(Schema.addresses.kodepos.id, kodepos_id)
            )
            .limit(1)
            .then(async results => results.length > 0 ? results[0] : null)
            .catch(async err => {
                console.error("getAddressDetails.kodepos", err);
                return null;
            });
        
        // check one by one
        const dont_exist = new Array<string>();
        if (!provinsi)  dont_exist.push("provinsi");
        if (!kabupaten) dont_exist.push("kabupaten");
        if (!kecamatan) dont_exist.push("kecamatan");
        if (!kelurahan) dont_exist.push("kelurahan");
        if (!kodepos)   dont_exist.push("kodepos");
        
        if (dont_exist.length > 0) return {
            status: 'error',
            result: `address_not_found: ${dont_exist.join(", ")}`
        };

        return {
            status: 'ok',
            result: {
                provinsi,
                kabupaten,
                kecamatan,
                kelurahan,
                kodepos
            }
        }
    }

export default {
    addEnabledKecamatan,
    removeEnabledKecamatanByKecamatanId,
    removeEnabledKecamatanById,
    getAddressDetails
}