import { eq } from 'drizzle-orm';
import DBController from '../database';
import * as Schema from '../database/schemas';
import { TReturn } from './__types';
import { TCustomer } from '../database/schemas/customers';


export const getCustomerById = async (
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

export const getCustomerByPhone = async (
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

export const customerPhoneNumberIsExist = async (
        phone_number: string
    ): Promise<TReturn<Boolean>> => await getCustomerByPhone(phone_number)
        .then(async result => ({
            status: 'ok',
            result: result !== null
        }))
        .catch(async err => {
            console.error("CHECK Customer", err);
            return {
                status: 'error',
                result: err
            }
        });

export const createNewCustomer = async (data: {
    fullname: string,
    phone_number: string,
    
    kelurahan_id: number,
    kecamatan_id: number,
    kabupaten_id: number,
    provinsi_id: number,
    kodepos_id: number,
    
    address: string,

    coord_lati: number,
    coord_long: number,
}): Promise<TReturn<TCustomer>> => await customerPhoneNumberIsExist(data.phone_number)
        .then(async phoneNumberExist => {
            if (phoneNumberExist) return {
                status: 'error',
                result: 'phone_number_exist' // TODO: make all possible errors in an integer map
            };
            
            // TODO: Normalize this mofos!!!! NOW !
            return await DBController.insert(Schema.customers.customers)
                .values({
                    fullname: data.fullname,
                    phone_number: data.phone_number,
                    
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
    getCustomerById,
    getCustomerByPhone,
    customerPhoneNumberIsExist,
    createNewCustomer,
};