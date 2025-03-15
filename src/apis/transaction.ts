import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import DBController from '../database';
import Schema from '../database/schemas';
import APICustomer from './customer';
import { getDeliveryPlanById, getProductById, getProductLatestPrice } from './product';
import { TDeliveryPlan, TFullProductPrice, TProduct, TProductPrice } from '../database/schemas/products';
import { TReturn } from './_types';
import { TInvoice, TInvoiceItems } from '../database/schemas/transactions';


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

export const getInvoiceCountOnMonthYear = async (
        month: number,
        year: number
): Promise<TReturn<number>> => {
    const currentMonth = new Date();
    // strip the day and time to beginning of the month
    currentMonth.setFullYear(year);
    currentMonth.setMonth(month);
    currentMonth.setDate(1);
    currentMonth.setHours(0);
    currentMonth.setMinutes(0);
    currentMonth.setSeconds(0);
    currentMonth.setMilliseconds(0);

    const maxDayThisMonth = new Date(year, month, 0).getDate();
    const endOfMonth = new Date();
    endOfMonth.setFullYear(year);
    endOfMonth.setMonth(month);
    endOfMonth.setDate(maxDayThisMonth);
    endOfMonth.setHours(23);
    endOfMonth.setMinutes(59);

    return await DBController.select({ count: count() })
        .from(Schema.transactions.invoice)
        .where(
            and(
                gte(Schema.transactions.invoice.date, currentMonth),
                lte(Schema.transactions.invoice.date, endOfMonth)
            )
        )
        .then(async results => ({
            status: 'ok',
            result: results[0].count
        }))
        .catch(async (err: Error) => {
            console.error("getInvoiceCountOnMonthYear", err);
            return {
                status: 'error',
                result: err
            }
        })
};

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
            const productPrice = (retval_productPrice.result as TProductPrice).price;

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
                product_id: product.id,
                product_name: product.name,
                product_price: productPrice,
                quantity: 12
            };

            const totalPrice = productPrice * 12;
            const priceAfterTax = totalPrice + (totalPrice * (12 / 100));

            // create order id
            const invoiceCountThisMonth_res = await getInvoiceCountOnMonthYear(new Date().getMonth() + 1, new Date().getFullYear());
            if (invoiceCountThisMonth_res.status !== 'ok') return {
                status: 'error',
                result: invoiceCountThisMonth_res.result as Error | string
            };

            const date = new Date();
            const invoiceCountThisMonth = invoiceCountThisMonth_res.result as number;
            const paddedCount = (invoiceCountThisMonth + 1).toString().padStart(6, '0');
            const paddedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
            const paddedYear = date.getFullYear().toString();
            const hash = (new Bun.CryptoHasher('sha256')).update(`${customer_id}-${paddedCount}-${paddedMonth}-${paddedYear}`).digest('hex');
            const order_id = `INV-${paddedCount}-${paddedMonth}${paddedYear}-${hash.slice(0, 6)}`;

            const invoice = await DBController.insert(Schema.transactions.invoice)
                .values({
                    customer_id,
                    order_id: order_id,
                    date: new Date(),
                    total: priceAfterTax,
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
            
            console.log("createNewInvoice.addInvoiceItem", dbInvoiceItem);

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

export const getInvoicesByCount = async (
    count: number
): Promise<TReturn<TInvoice[]>> => await DBController.select()
    .from(Schema.transactions.invoice)
    .orderBy(desc(Schema.transactions.invoice.date))
    .limit(count)
    .then(async results => ({
        status: 'ok',
        result: results
    }))
    .catch(async (err: Error) => {
        console.error("getInvoiceByCount", err);
        return {
            status: 'error',
            result: err
        }
    }
);

export const getInvoicesByIdRange = async (
    idStart: number,
    idEnd: number
): Promise<TReturn<TInvoice[]>> => await DBController.select()
        .from(Schema.transactions.invoice)
        .where(
            and(
                gte(Schema.transactions.invoice.id, idStart),
                lte(Schema.transactions.invoice.id, idEnd)
            )
        )
        .then(async results => ({
            status: 'ok',
            result: results
        }))
        .catch(async (err: Error) => {
            console.error("getInvoicesByIdRange", err);
            return {
                status: 'error',
                result: err
            }
        }
);

export const getInvoiceItemsByInvoiceId = async (
    invoice_id: number
): Promise<TReturn<(TInvoiceItems & { product: TProduct | null })[]>> => await DBController.select()
    .from(Schema.transactions.invoiceItems)
    .where(
        eq(Schema.transactions.invoiceItems.invoice_id, invoice_id)
    )
    .then(async results => {
        const r = new Array<TInvoiceItems & { product: TProduct | null }>();
        for(const invoiceItem of results) {
            const product = await getProductById(invoiceItem.product_id);
            if (product.status !== 'ok') {
                console.error("getInvoiceItemsByInvoiceId.getProductById", product.result);
                r.push({
                    ...invoiceItem,
                    product: null
                })
            }

            r.push({
                ...invoiceItem,
                product: product.result as TProduct
            })
        }

        return {
            status: 'ok',
            result: r
        }
    })
    .catch(async (err: Error) => {
        console.error("getInvoiceItemsByInvoiceId", err);
        return {
            status: 'error',
            result: err
        }
    });

export default {
    createNewInvoice,
    getInvoiceById,
    getInvoicesByCount,
    getInvoicesByIdRange,
    getInvoiceItemsByInvoiceId
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