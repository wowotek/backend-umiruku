import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { and, eq, gte, like, lte } from 'drizzle-orm';

import API from '../../apis';
import { TProduct } from '../../database/schemas/products';


const route_Product = new Hono();

const MAX_RESULT_COUNT = 25;

// GET All Product
route_Product.get(
    '/',
    async (c) => API.Product
        .getProductManyByCount(
            Math.max(
                parseInt(c.req.query('count') ?? String(MAX_RESULT_COUNT)),
                MAX_RESULT_COUNT
            )
        )
        .then(async results => c.json(results))
        .catch(async err => c.json({
            status: 'error',
            result: err
        }))
);

route_Product.post(
    '/',
    zValidator('json', z.object({
        name: z.string()
    })),
    async (c) => API.Product
        .createProduct(c.req.valid('json').name)
        .then(async results => c.json({
            status: "ok",
            result: (results.result as TProduct[])[0]
        }))
        .catch(async err => c.json({
            status: 'error',
            result: err
        }))

)

route_Product.post(
    '/price',
    zValidator('json', z.object({
        product_id: z.number(),
        price: z.number()
    })),
    async (c) => API.Product
        .createProductPrice(
            c.req.valid('json').product_id,
            c.req.valid('json').price
        )
        .then(async results => c.json({
            status: 'ok',
            result: results
        }))
        .catch(async err => c.json({
            status: 'error',
            result: err
        }))
)

route_Product.get(
    '/delivery-plan',
    async (c) => API.Product
        .getDeliveryPlanManyByCount(Math.max(parseInt(c.req.query('count') ?? String(MAX_RESULT_COUNT)), MAX_RESULT_COUNT))
        .then(async results => c.json(results))
        .catch(async err => c.json({
            status: 'error',
            result: err
        }))
    
)

export default route_Product;