import { eq } from 'drizzle-orm';
import DBController from '../database';
import * as Schema from '../database/schemas';


export const getCustomerById = async (customer_id: number) => await DBController.select()
    .from(Schema.customers.customers)
    .where(
        eq(Schema.customers.customers.id, customer_id)
    )
    .limit(1)
    .then(async results => results.length > 0 ? results[0] : null)
    .catch(async err => {
        console.error("GET Customer", err);
        throw err;
    });

export const getCustomerByPhone = async (phone_number: string) => await DBController.select()
    .from(Schema.customers.customers)
    .where(
        eq(Schema.customers.customers.phone_number, phone_number)
    )
    .limit(1)
    .then(async results => results.length > 0 ? results[0] : null)

export const customerPhoneNumberIsExist = async (phone_number: string) => await getCustomerByPhone(phone_number)
    .then(async result => result !== null)
    .catch(async err => {
        console.error("CHECK Customer", err);
        throw err;
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
}) => await customerPhoneNumberIsExist(data.phone_number)
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
                        throw err;
                    })
                )   
                .catch(async err => {
                    console.error("CREATE Customer", err);
                    throw err;
                });
        })

export default {
    getCustomerById,
    getCustomerByPhone,
    customerPhoneNumberIsExist,
    createNewCustomer,
};