import { desc, eq } from 'drizzle-orm';
import DBController from '../database';
import Schema from '../database/schemas';
import { TReturn } from './_types';
import { TDeliveryPlan, TFullProductPrice, TProduct, TProductPrice } from '../database/schemas/products';


// ======================= Product =======================
export const getProductManyByCount = async (
        count: number
    ): Promise<TReturn<TProduct[]>> => await DBController
        .select()
        .from(Schema.product.product)
        .limit(count)
        .then(async results => ({
            status: 'ok',
            result: results
        }))
        .catch(async (err: Error) => {
            console.error("getProductManyByCount", err);
            return {
                status: 'error',
                result: err
            }
        });

export const getProductById = async (
        product_id: number
    ): Promise<TReturn<TProduct>> => await DBController
        .select()
        .from(Schema.product.product)
        .where(
            eq(Schema.product.product.id, product_id)
        )
        .then(async results => results.length > 0 ? {
            status: 'ok',
            result: results[0]
         } : {
            status: 'error',
            result: null
         })
        .catch(async (err: Error) => {
            console.error("getProductById", err);
            return {
                status: 'error',
                result: err
            }
        });

export const createProduct = async (
        ...productName: string[]
    ): Promise<TReturn<TProduct[]>> => await DBController
        .insert(Schema.product.product)
        .values(productName.map(name => ({ name })))
        .$returningId()
        .then(async ids => {
            const products: Array<TProduct> = [];
            for(const id of ids) {
                const status_product = await getProductById(id.id);
                if(status_product.status === 'ok')
                    products.push(status_product.result as TProduct);
            }

            return {
                status: 'ok',
                result: products
            }
        })
        .catch(async (err: Error) => {
            console.error("createProduct", err);
            return {
                status: 'error',
                result: err
            }
        });

export const updateProduct = async (
        target_id: number,
        name: string
    ): Promise<TReturn<TProduct>> => await DBController
        .update(Schema.product.product)
        .set({ name })
        .where(
            eq(Schema.product.product.id, target_id)
        )
        .then(async () => await getProductById(target_id))
        .catch(async (err: Error) => {
            console.error("updateProduct", err);
            return {
                status: 'error',
                result: err
            }
        });

export const deleteProduct = async (
        ...target_id: number[]
    ) => {
        // TODO: Implement this with checking if the product is used in any table
        // const results: Array<TProduct> = [];
        // for(const id of target_id) {
        //     const status_product = await getProductById(id);
        //     if(status_product.status === 'ok') {
        //         results.push(status_product.result as TProduct);
        //         await DBController
        //             .delete(Schema.product.product)
        //             .where(
        //                 eq(Schema.product.product.id, id)
        //             );
        //     }
        // }

        // return {
        //     status: 'ok',
        //     result: results
        // };
    }
// ======================= Product Price =======================
export const getProductLatestPrice = async (
        product_id: number
    ): Promise<TReturn<TFullProductPrice>> => await DBController
        .select()
        .from(Schema.product.productPrice)
        .fullJoin(Schema.product.product, eq(Schema.product.product.id, Schema.product.productPrice.product_id))
        .where(
            eq(Schema.product.productPrice.product_id, product_id)
        )
        .orderBy(desc(Schema.product.productPrice.date))
        .limit(1)
        .then(async results => results.length > 0 ? 
            {
                status: 'ok',
                result: results[0]
            } : {
                status: 'not_found',
                result: null
            })
        .catch(async (err: Error) => {
            console.error("getProductLatestPrice", err);
            return {
                status: 'error',
                result: err
            }
        });

export const createProductPrice = async (
        product_id: number,
        price: number
    ): Promise<TReturn<TFullProductPrice>> => await getProductById(product_id)
        .then(async product => await DBController
            .insert(Schema.product.productPrice)
            .values({ product_id, price, date: new Date() })
            .$returningId()
            .then(async ids => {
                const status_productPrice = await getProductLatestPrice(product_id);
                if(status_productPrice.status === 'ok')
                    return status_productPrice;
                return {
                    status: 'error',
                    result: status_productPrice.result
                }
            })
            .catch(async (err: Error) => {
                console.error("createProductPrice", err);
                return {
                    status: 'error',
                    result: err
                }
            })
        )
        .catch(async (err: Error) => {
            console.error("createProductPrice", err);
            return {
                status: 'error',
                result: err
            }
        });
/**
 * DISCLAIMER:
 *      There is no update and delete because product Price is a history
 */

// ======================= Delivery Plan =======================
export const getDeliveryPlanManyByCount = async (
        count: number
    ): Promise<TReturn<TDeliveryPlan[]>> => await DBController
        .select()
        .from(Schema.product.deliveryPlan)
        .limit(count)
        .then(async results => ({
            status: 'ok',
            result: results
        }))
        .catch(async (err: Error) => {
            console.error("getDeliveryPlanManyByCount", err);
            return {
                status: 'error',
                result: err
            }
        });
        
export const getDeliveryPlanById = async (
        delivery_plan_id: number
    ): Promise<TReturn<TDeliveryPlan>> => await DBController
        .select()
        .from(Schema.product.deliveryPlan)
        .where(
            eq(Schema.product.deliveryPlan.id, delivery_plan_id)
        )
        .then(async results => results.length > 0 ? {
                status: 'ok',
                result: results[0] 
            } : {
                status: 'error',
                result: null
            })
        .catch(async err => {
            console.error("getDeliveryPlanById", err);
            return {
                status: 'error',
                result: err
            }
        });


export default {
    getProductLatestPrice,
    getProductManyByCount,
    getProductById,
    createProduct,

    getDeliveryPlanById
};