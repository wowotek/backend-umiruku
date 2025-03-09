import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { and, eq, gte, like, lte } from 'drizzle-orm';

import DBController from '../../database/database';
import * as Schema from '../../database/schemas';


const route_Customer = new Hono();

const MAX_RESULT_COUNT = 25;

// CREATE customer
route_Customer.post(
    '/',
    zValidator('json', z.object(
        {
            fullname: z.string().nonempty(),
            phone_number: z.string().nonempty(),
            address: z.string().nonempty(),

            kelurahan_id: z.number().min(1),
            kecamatan_id: z.number().min(1),
            kabupaten_id: z.number().min(1),
            provinsi_id: z.number().min(1),
            kodepos_id: z.number().min(1),
            coord_lati: z.number(),
            coord_long: z.number(),
        }
    )),
    async (c) => {
        const validated = c.req.valid('json');

        return DBController.insert(Schema.customers.customers)
            .values({
                fullname: validated.fullname,
                phone_number: validated.phone_number,
                
                kelurahan_id: validated.kelurahan_id,
                kecamatan_id: validated.kecamatan_id,
                kabupaten_id: validated.kabupaten_id,
                provinsi_id: validated.provinsi_id,
                kodepos_id: validated.kodepos_id,
                
                full_address: validated.address,

                coord_lati: validated.coord_lati.toString(),
                coord_long: validated.coord_long.toString(),
            })
            .then(async result => {
                return c.json({
                    status: 'ok',
                    result
                }, 201);
            })
            .catch(async err => {
                console.error("CREATE Customer", err);
                return c.json({
                    status: 'error',
                    error: err
                }, 500);
            });
    }
);

// GET customer by substrs
route_Customer.get(
    '/',
    async (c) => {
        const fullname = c.req.query('fullname') ?? "";
        const phone_number = c.req.query('phone_number') ?? "";

        return DBController.select().from(Schema.customers.customers)
            .where(
                and(
                    like(Schema.customers.customers.fullname, fullname),
                    like(Schema.customers.customers.phone_number, phone_number)
                )
            )
            .limit(MAX_RESULT_COUNT)
            .then(async results => {
                return c.json({
                    status: 'ok',
                    results
                });
            });
    }
);

// GET customer by id range
route_Customer.get(
    '/id',
    zValidator('query', z.object(
        {
            id_start: z.number().min(1),
            id_end: z.number().min(1),
        }
    )),
    async (c) => {
        const request = c.req.valid('query');

        return DBController.select().from(Schema.customers.customers)
            .where(
                and(
                    gte(Schema.customers.customers.id, request.id_start),
                    lte(Schema.customers.customers.id, request.id_end)
                )
            )
            .limit(MAX_RESULT_COUNT)
            .then(async results => {
                return c.json({
                    status: 'ok',
                    results
                });
            });
    }
);

export default route_Customer;