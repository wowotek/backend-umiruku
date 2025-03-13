import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { and, eq, gte, like, lte } from 'drizzle-orm';

import DBController from '../../database';
import Schema from '../../database/schemas';
import API from '../../apis';
import { createNewInvoice } from '../../apis/transaction';
import { TCustomer } from '../../database/schemas/customers';
import { TInvoice } from '../../database/schemas/transactions';
import { TKabupaten, TKecamatan, TKelurahan, TKodepos, TProvinsi } from '../../database/schemas/addresses';


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

        const address_details = await API.Address.getAddressDetails(
            validated.provinsi_id,
            validated.kabupaten_id,
            validated.kecamatan_id,
            validated.kelurahan_id,
            validated.kodepos_id
        );

        if (address_details.status === "error") return c.json({
            status: 'error',
            result: address_details.result
        });

        const addresses = address_details.result as {
            provinsi: TProvinsi,
            kabupaten: TKabupaten,
            kecamatan: TKecamatan,
            kelurahan: TKelurahan,
            kodepos: TKodepos,
        };

        const optional_request = await c.req.json();
        const email = optional_request?.email ?? "";

        const customer_data = await API.Customer.createOne({
            email: email ?? "",
            fullname: validated.fullname,
            phone_number: validated.phone_number,

            provinsi_id: addresses.provinsi.id,
            kabupaten_id: addresses.kabupaten.id,
            kecamatan_id: addresses.kecamatan.id,
            kelurahan_id: addresses.kelurahan.id,
            kodepos_id: addresses.kodepos.id,

            address: validated.address,
            coord_lati: validated.coord_lati,
            coord_long: validated.coord_long,
        });

        if (customer_data.status === "error") return c.json({
            status: 'error',
            result: customer_data.result
        });

        const customer = customer_data.result as TCustomer;
        return c.json({
            status: 'ok',
            result: customer,
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
    async (c) => await API.Customer
        .getManyByMinMaxId(
            c.req.valid('query').id_start,
            c.req.valid('query').id_end
        ).then(async results => {
            return c.json({
                status: 'ok',
                results: results.result
            });
    })
);

export default route_Customer;