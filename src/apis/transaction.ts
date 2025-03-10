import { eq } from 'drizzle-orm';
import DBController from '../database';
import * as Schema from '../database/schemas';
import { getCustomerById } from './customer';
import { getDeliveryPlanById, getProductById, getProductLatestPrice } from './product';

export const getInvoiceById = async (invoice_id: number) => await DBController.select()
    .from(Schema.transactions.invoice)
    .where(
        eq(Schema.transactions.invoice.id, invoice_id)
    )
    .limit(1)
    .then(async results => results.length > 0 ? results[0] : null)
    .catch(async err => {
        console.error("getInvoiceById", err);
        throw err;
    }); 

export const createNewInvoice = async (
    customer_id: number,
    product_id: number,
    delivery_plan_id: number,
) => await getCustomerById(customer_id)
    .then(async customer => {
        if (customer === null) return {
            status: 'error',
            result: 'customer_not_found'
        };

        const product = await getProductById(product_id);
        if (product === null) return {
            status: 'error',
            result: 'product_not_found'
        };

        const productPrice = await getProductLatestPrice(product_id);
        if (productPrice === null) return {
            status: 'error',
            result: 'product_price_not_found'
        };

        const deliveryPlan = await getDeliveryPlanById(delivery_plan_id);
        if (deliveryPlan === null) return {
            status: 'error',
            result: 'delivery_plan_not_found'
        };

        return await DBController.insert(Schema.transactions.invoice)
            .values({
                customer_id,
                product_price_id: productPrice.id,
                delivery_plan_id,
                total: productPrice.price,
                method: 'transfer',
                status: 'pending',
            })
            .$returningId()
            .then(async result => await getInvoiceById(result[0].id))
            .catch(async err => {
                console.error("createNewInvoice", err);
                throw err;
    })
    .catch(async err => {
        console.error("createNewInvoice", err);
        throw err;
    });
});

export default {
    createNewInvoice
};


// id: int().autoincrement().primaryKey(),
// customer_id: int().references(() => customers.id),
// date: datetime(),

// product_price_id: int().references(() => productPrice.id),
// delivery_plan_id: int().references(() => deliveryPlan.id),

// total: int(), // Rupiah * 1000
// method: varchar({ length: 255, enum: ['transfer'] }),
// status: varchar({ length: 255, enum: ['pending', 'success', 'failed', "cancelled"] }),
// bukti_transfer_file_id: int().references(() => files.id),