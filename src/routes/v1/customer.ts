import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { and, eq, gte, like, lte } from 'drizzle-orm';

import DBController from '../../database';
import * as Schema from '../../database/schemas';
import { createNewCustomer } from '../../apis/customer';
import { createNewInvoice } from '../../apis/transaction';
import { TCustomer } from '../../database/schemas/customers';
import { TInvoice } from '../../database/schemas/transactions';


const route_Customer = new Hono();

const MAX_RESULT_COUNT = 25;

// CREATE customer
route_Customer.post(
    '/',
    zValidator('json', z.object(
        {
            product_id: z.number().int().min(1),
            delivery_plan_id: z.number().int().min(1),

            fullname: z.string().nonempty(),
            phone_number: z.string().nonempty(),
            address: z.string().nonempty(),

            kelurahan_id: z.number().int().min(1),
            kecamatan_id: z.number().int().min(1),
            kabupaten_id: z.number().int().min(1),
            provinsi_id: z.number().int().min(1),
            kodepos_id: z.number().int().min(1),
            coord_lati: z.number(),
            coord_long: z.number(),
        }
    )),
    async (c) => {
        const validated = c.req.valid('json');
        const customer_data = await createNewCustomer({
            fullname: validated.fullname,
            phone_number: validated.phone_number,
            kelurahan_id: validated.kelurahan_id,
            kecamatan_id: validated.kecamatan_id,
            kabupaten_id: validated.kabupaten_id,
            provinsi_id: validated.provinsi_id,
            kodepos_id: validated.kodepos_id,
            address: validated.address,
            coord_lati: validated.coord_lati,
            coord_long: validated.coord_long,
        });

        if (customer_data.status === "error") return c.json({
            status: 'error',
            result: customer_data.result
        });

        const customer = customer_data.result as TCustomer;
        const invoice_data = await createNewInvoice(customer.id, validated.product_id, validated.delivery_plan_id);

        if (!invoice_data) return c.json({
            status: 'error',
            result: "server_error"
        });

        if (invoice_data.status === "error") return c.json({
            status: 'error',
            result: invoice_data.result
        });

        const invoice = invoice_data as TInvoice;
        return c.json({
            status: 'ok',
            result: {
                customer,
                invoice
            }
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
            id_start: z.number().int().min(1),
            id_end: z.number().int().min(1),
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