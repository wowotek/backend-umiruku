import { and, eq, gte, lte, min } from 'drizzle-orm';
import DBController from '../database';
import Schema from '../database/schemas';
import { TReturn } from './_types';
import { TCustomer } from '../database/schemas/customers';


export const getOneById = async (
        customer_id: number
    ): Promise<TReturn<TCustomer>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            eq(Schema.customers.customers.id, customer_id)
        )
        .limit(1)
        .then(async results => 
            results.length > 0 ? {
                status: 'ok',
                result: results[0] /* this is a customer */
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
    ): Promise<TReturn<TCustomer>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            eq(Schema.customers.customers.phone_number, phone_number)
        )
        .limit(1)
        .then(async results => results.length > 0 ? {
            status: 'ok',
            result: results[0] 
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
    ): Promise<TReturn<TCustomer>> => await DBController.select()
        .from(Schema.customers.customers)
        .where(
            eq(Schema.customers.customers.email, email)
        )
        .limit(1)
        .then(async results => results.length > 0 ? {
            status: 'ok',
            result: results[0] 
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
            result: results
        }));

export const getManyCount = async (
        count: number
    ): Promise<TReturn<TCustomer[]>> => await DBController.select()
        .from(Schema.customers.customers)
        .limit(count)
        .then(async results => ({
            status: 'ok',
            result: results
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
                    .then(r => ({
                        status: 'ok',
                        result: r[0]
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
        })

export default {
    getOneById,
    getOneByPhone,
    getOneByEmail,
    getManyByMinMaxId,
    getManyCount,
    createOne,
};