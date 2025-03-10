import { desc, eq } from 'drizzle-orm';
import DBController from '../database';
import * as Schema from '../database/schemas';

export const getProductById = async (product_id: number) => await DBController
    .select()
    .from(Schema.product.product)
    .where(
        eq(Schema.product.product.id, product_id)
    )
    .then(async results => results.length > 0 ? results[0] : null)
    .catch(async err => {
        console.error("getProductById", err);
        throw err;
    });

export const getProductLatestPrice = async (product_id: number) => await DBController
    .select()
    .from(Schema.product.productPrice)
    .where(
        eq(Schema.product.productPrice.product_id, product_id)
    )
    .orderBy(desc(Schema.product.productPrice.date))
    .limit(1)
    .then(async results => results.length > 0 ? results[0] : null)
    .catch(async err => {
        console.error("getProductLatestPrice", err);
        throw err;
    });

export const getDeliveryPlanById = async (delivery_plan_id: number) => await DBController
    .select()
    .from(Schema.product.deliveryPlan)
    .where(
        eq(Schema.product.deliveryPlan.id, delivery_plan_id)
    )
    .then(async results => results.length > 0 ? results[0] : null)
    .catch(async err => {
        console.error("getDeliveryPlanById", err);
        throw err;
    }
);

export default {
  getProductLatestPrice
};