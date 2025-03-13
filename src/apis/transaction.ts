import { eq } from 'drizzle-orm';
import DBController from '../database';
import Schema from '../database/schemas';
import APICustomer from './customer';
import { getDeliveryPlanById, getProductById, getProductLatestPrice } from './product';
import { TDeliveryPlan, TFullProductPrice, TProduct, TProductPrice } from '../database/schemas/products';
import { TReturn } from './_types';
import { TInvoice } from '../database/schemas/transactions';


export const getInvoiceById = async (
        invoice_id: number
    ): Promise<TReturn<TInvoice>> => await DBController.select()
        .from(Schema.transactions.invoice)
        .where(
            eq(Schema.transactions.invoice.id, invoice_id)
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
            console.error("getInvoiceById", err);
            return {
                status: 'error',
                result: err
            }
        }); 

export const createNewInvoice = async (
        customer_id: number,
        product_id: number,
        delivery_plan_id: number,
    ): Promise<TReturn<TInvoice>> => await APICustomer.getOneById(customer_id)
        .then(async customer => {
            if (customer === null) return {
                status: 'error',
                result: 'customer_not_found'
            };

            const retval_product = await getProductById(product_id);
            if (retval_product.result === null) return {
                status: 'error',
                result: 'product_not_found'
            };
            if (retval_product.status !== 'ok') return {
                status: 'error',
                result: retval_product.result as Error | string
            };
            const product = retval_product.result as TProduct;

            const retval_productPrice = await getProductLatestPrice(product_id);
            if (retval_productPrice.result === null) return {
                status: 'error',
                result: 'product_price_not_found'
            };
            if (retval_productPrice.status !== 'ok') return {
                status: 'error',
                result: retval_productPrice.result as Error | string
            };
            const productPrice = (retval_productPrice.result as TFullProductPrice).product_price as TProductPrice;

            const retval_deliveryPlan = await getDeliveryPlanById(delivery_plan_id);
            if (retval_deliveryPlan.result === null) return {
                status: 'error',
                result: 'delivery_plan_not_found'
            };
            if (retval_deliveryPlan.status !== 'ok') return {
                status: 'error',
                result: retval_deliveryPlan.result as Error | string
            };
            const deliveryPlan = retval_deliveryPlan.result as TDeliveryPlan;

            const invoiceItem = {
                product_name: product.name,
                product_price: productPrice.price,
                quantity: 1
            };

            const invoice = await DBController.insert(Schema.transactions.invoice)
                .values({
                    customer_id,
                    date: new Date(),
                    total: -1,
                    method: 'transfer',
                    status: 'pending',
                })
                .$returningId()
                .then(async result => await getInvoiceById(result[0].id))
                .catch(async (err: Error) => {
                    console.error("createNewInvoice", err);
                    throw err;
                });
            
            if (invoice.result === null) return {
                status: 'error',
                result: 'invoice_not_found'
            };

            const invoiceResult = invoice.result as TInvoice;
            
            // link the invoice with the invoice item
            const dbInvoiceItem = await DBController.insert(Schema.transactions.invoiceItems)
                .values({
                    invoice_id: invoiceResult.id as number,
                    ...invoiceItem
                })
                .$returningId()
                .then(async result => await DBController.select().from(Schema.transactions.invoiceItems)
                    .where(eq(Schema.transactions.invoiceItems.id, result[0].id))
                    .limit(1)
                    .then(async results => results.length > 0 ? {
                        status: 'ok',
                        result: results[0]
                    } : {
                        status: 'error',
                        result: 'invoice_item_not_found'
                    })
                    .catch(async (err: Error) => {
                        console.error("createNewInvoice.linkInvoiceItem", err);
                        return {
                            status: 'error',
                            result: err
                        }
                    })
                )
                .catch(async (err: Error) => {
                    console.error("createNewInvoice.linkInvoiceItem", err);
                    return {
                        status: 'error',
                        result: err
                    }
                });

            return {
                status: 'ok',
                result: invoice.result as TInvoice
            };
        })
        .catch(async err => {
            console.error("createNewInvoice.customerCheckById", err);
            return {
                status: 'error',
                result: err
            }
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