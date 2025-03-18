import { and, eq, gte, lte, min } from 'drizzle-orm';
import DBController from '../database';
import Schema from '../database/schemas';
import { TReturn } from './_types';
import { TCustomer } from '../database/schemas/customers';
import { TKabupaten, TKecamatan, TKelurahan, TKodepos, TProvinsi } from '../database/schemas/addresses';

export type TCustomerWithAddress = TCustomer & {
    provinsi: TProvinsi | null,
    kabupaten: TKabupaten | null,
    kecamatan: TKecamatan | null,
    kelurahan: TKelurahan | null,
    kodepos: TKodepos | null,
};

export const joinAddress = async (
    customer: TCustomer
): Promise<TCustomerWithAddress> => {
    const kelurahan = await DBController.select()
        .from(Schema.addresses.kelurahan)
        .where(eq(Schema.addresses.kelurahan.id, customer.kelurahan_id))
        .limit(1)
        .then(r => r[0])
        .catch(err => {
            console.error(err);
            return null
        });

    const kecamatan = await DBController.select()
        .from(Schema.addresses.kecamatan)
        .where(eq(Schema.addresses.kecamatan.id, customer.kecamatan_id))
        .limit(1)
        .then(r => r[0])
        .catch(err => {
            console.error(err);
            return null
        });

    const kabupaten = await DBController.select()
        .from(Schema.addresses.kabupaten)
        .where(eq(Schema.addresses.kabupaten.id, customer.kabupaten_id))
        .limit(1)
        .then(r => r[0])
        .catch(err => {
            console.error(err);
            return null
        });

    const provinsi = await DBController.select()
        .from(Schema.addresses.provinsi)
        .where(eq(Schema.addresses.provinsi.id, customer.provinsi_id))
        .limit(1)
        .then(r => r[0])
        .catch(err => {
            console.error(err);
            return null
        });

    const kodepos = await DBController.select()
        .from(Schema.addresses.kodepos)
        .where(eq(Schema.addresses.kodepos.id, customer.kodepos_id))
        .limit(1)
        .then(r => r[0])
        .catch(err => {
            console.error(err);
            return null
        });

    // TODO: i don't know which to choose, throw it or just return null, for now returning null is possible
    if (kelurahan) {}
    if (kecamatan) {}
    if (kabupaten) {}
    if (provinsi) {}
    if (kodepos) {}
    
    return {
        ...customer,
        kelurahan,
        kecamatan,
        kabupaten,
        provinsi,
        kodepos
    };
}

export const joinAddresses = async (
    customers: TCustomer[]
): Promise<TCustomerWithAddress[]> => await Promise.all(customers.map(async customer => await joinAddress(customer)));

export const getOneById = async (
        customer_id: number
    ): Promise<TReturn<TCustomerWithAddress>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            eq(Schema.customers.customers.id, customer_id)
        )
        .limit(1)
        .then(async results => 
            results.length > 0 ? {
                status: 'ok',
                result: await joinAddress(results[0]) /* this is a customer */
            } : {
                status: 'error',
                result: 'customer_not_found'
            }
        )
        .catch(async (err: Error) => {
            console.error("GET Customer", err);
            return {
                status: 'error',
                result: err
            }
        });

export const getOneByPhone = async (
        phone_number: string
    ): Promise<TReturn<TCustomerWithAddress>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            eq(Schema.customers.customers.phone_number, phone_number)
        )
        .limit(1)
        .then(async results => results.length > 0 ? {
            status: 'ok',
            result: await joinAddress(results[0]) 
        } : {
            status: 'error',
            result: null
        })
        .catch(async err => {
            console.error("GET Customer by Phone", err);
            return {
                status: 'error',
                result: err
            }
        });

export const getOneByEmail = async (
        email: string
    ): Promise<TReturn<TCustomerWithAddress>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            eq(Schema.customers.customers.email, email)
        )
        .limit(1)
        .then(async results => results.length > 0 ? {
            status: 'ok',
            result: await joinAddress(results[0]) 
        } : {
            status: 'error',
            result: null
        })
        .catch(async err => {
            console.error("GET Customer by Email", err);
            return {
                status: 'error',
                result: err
            }
        });

export const getManyByMinMaxId = async (
        min: number,
        max: number
    ): Promise<TReturn<TCustomer[]>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            and(
                gte(Schema.customers.customers.id, min),
                lte(Schema.customers.customers.id, max)
            )
        )
        .then(async results => ({
            status: 'ok',
            result: await joinAddresses(results)
        }));

export const getManyCount = async (
        count: number
    ): Promise<TReturn<TCustomer[]>> => await DBController.select()
        .from(Schema.customers.customers)
        .limit(count)
        .then(async results => ({
            status: 'ok',
            result: await joinAddresses(results)
        }));

export const createOne = async (data: {
    fullname: string,
    phone_number: string,
    email?: string,
    
    kelurahan_id: number,
    kecamatan_id: number,
    kabupaten_id: number,
    provinsi_id: number,
    kodepos_id: number,
    
    address: string,

    coord_lati: number,
    coord_long: number,
}): Promise<TReturn<TCustomer>> => await getOneByPhone(data.phone_number)
        .then(async customer => {
            if (customer.result !== null) return {
                status: 'error',
                result: 'phone_number_exist'
            };

            // if using email, check if email is exist
            if (data.email) {
                const emailExist = await getOneByEmail(data.email);
                if (emailExist.result !== null) return {
                    status: 'error',
                    result: 'email_exist'
                };
            }

            
            // TODO: Normalize this mofos!!!! NOW !
            return await DBController.insert(Schema.customers.customers)
                .values({
                    fullname: data.fullname,
                    phone_number: data.phone_number,
                    email: data.email,
                    
                    kelurahan_id: data.kelurahan_id,
                    kecamatan_id: data.kecamatan_id,
                    kabupaten_id: data.kabupaten_id,
                    provinsi_id: data.provinsi_id,
                    kodepos_id: data.kodepos_id,
                    
                    full_address: data.address,
                    
                    coord_lati: data.coord_lati.toString(),
                    coord_long: data.coord_long.toString(),
                })
                .$returningId()
                .then(async insertedId => await DBController.select()
                    .from(Schema.customers.customers)
                    .where(eq(Schema.customers.customers.id, insertedId[0].id))
                    .then(async r => ({
                        status: 'ok',
                        result: await joinAddress(r[0])
                    }))
                    .catch(async err => {
                        console.error("GET Customer", err);
                        return {
                            status: 'error',
                            result: err
                        }
                    })
                )   
                .catch(async err => {
                    console.error("CREATE Customer", err);
                    return {
                        status: 'error',
                        result: err
                    }
                });
        });

export const getManyInArea = async (
    offset: number,
    count: number,
): Promise<TReturn<TCustomerWithAddress[]>> => await DBController.select()
export const getManyOutArea;
export const getManyActive;

export default {
    getOneById,
    getOneByPhone,
    getOneByEmail,
    getManyByMinMaxId,
    getManyCount,
    createOne,
};