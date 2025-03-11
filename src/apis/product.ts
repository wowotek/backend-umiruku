import { desc, eq } from 'drizzle-orm';
import DBController from '../database';
import * as Schema from '../database/schemas';
import { TReturn } from './__types';
import { TProduct, TProductPrice } from '../database/schemas/products';


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

export const getProductLatestPrice = async (
        product_id: number
    ): Promise<TReturn<TProductPrice>> => await DBController
        .select()
        .from(Schema.product.productPrice)
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

export const getDeliveryPlanById = async (
        delivery_plan_id: number
    ) => await DBController
        .select()
        .from(Schema.product.deliveryPlan)
        .where(
            eq(Schema.product.deliveryPlan.id, delivery_plan_id)
        )
        .then(async results => results.length > 0 ? results[0] : null)
        .catch(async err => {
            console.error("getDeliveryPlanById", err);
            throw err;
        });

export default {
  getProductLatestPrice
};