import { Hono } from 'hono';

import * as Schema from '../../database/schemas';
import DBController from '../../database/database';
import { gte, lte, and, like, eq } from 'drizzle-orm';

import { Cacher } from '../../utilities';


const route_Address = new Hono();

const MAX_RESULT_COUNT = 25;

// GET Provinsi By Substring
route_Address.get(
    '/provinsi/substr',
    async (c) => {
        const query_substr = c.req.query('substr') ?? "";

        console.log("PROVINSI", "Using Database");
        return DBController.select().from(Schema.addresses.provinsi)
            .where(
                like(Schema.addresses.provinsi.name, `%${query_substr}%`)
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

// GET Kabupaten By Substring
route_Address.get(
    '/kabupaten/substr', 
    async (c) => {
        const provinsi_id = parseInt(c.req.query('provinsi_id') ?? "-1");
        const query_substr = c.req.query('substr') ?? "";
    
        if (provinsi_id === -1) {
            return DBController.select().from(Schema.addresses.kabupaten)
                .where(
                    like(Schema.addresses.kabupaten.name, `%${query_substr}%`)
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        } else {
            return DBController.select().from(Schema.addresses.kabupaten)
                .where(
                    query_substr.length <= 0 ? 
                        eq(Schema.addresses.kabupaten.provinsi_id, provinsi_id)
                        : 
                        and(like(Schema.addresses.kabupaten.name, `%${query_substr}%`), eq(Schema.addresses.kabupaten.provinsi_id, provinsi_id))
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        }
    }
);

// GET Kecamatan By Substring
route_Address.get(
    '/kecamatan/substr',
    async (c) => {
        const kabupaten_id = parseInt(c.req.query('kabupaten_id') ?? "-1");
        const query_substr = c.req.query('substr') ?? "";
    
        if (kabupaten_id === -1) {
            return DBController.select().from(Schema.addresses.kecamatan)
                .where(
                    like(Schema.addresses.kecamatan.name, `%${query_substr}%`)
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        } else {
            return DBController.select().from(Schema.addresses.kecamatan)
                .where(
                    query_substr.length <= 0 ? 
                        eq(Schema.addresses.kecamatan.kabupaten_id, kabupaten_id)
                        : 
                        and(like(Schema.addresses.kecamatan.name, `%${query_substr}%`), eq(Schema.addresses.kecamatan.kabupaten_id, kabupaten_id))
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        }
    }
);

// GET Kelurahan By Substring
route_Address.get(
    '/kelurahan/substr',
    async (c) => {
        const kecamatan_id = parseInt(c.req.query('kecamatan_id') ?? "-1");
        const query_substr = c.req.query('substr') ?? "";
    
        if (kecamatan_id === -1) {
            return DBController.select().from(Schema.addresses.kelurahan)
                .where(
                    like(Schema.addresses.kelurahan.name, `%${query_substr}%`)
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        } else {
            return DBController.select().from(Schema.addresses.kelurahan)
                .where(
                    query_substr.length <= 0 ? 
                        eq(Schema.addresses.kelurahan.kecamatan_id, kecamatan_id)
                        : 
                        and(like(Schema.addresses.kelurahan.name, `%${query_substr}%`), eq(Schema.addresses.kelurahan.kecamatan_id, kecamatan_id))
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        }
    }
);

// GET Kodepos By Substring
route_Address.get(
    '/kodepos/substr',
    async (c) => {
        const kelurahan_id = parseInt(c.req.query('kelurahan_id') ?? "-1");
        const query_substr = c.req.query('substr') ?? "";
    
        if (kelurahan_id === -1) {
            return DBController.select().from(Schema.addresses.kodepos)
                .where(
                    like(Schema.addresses.kodepos.kodepos, `%${query_substr}%`)
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        } else {
            return DBController.select().from(Schema.addresses.kodepos)
                .where(
                    query_substr.length <= 0 ? 
                        eq(Schema.addresses.kodepos.kelurahan_id, kelurahan_id)
                        : 
                        and(like(Schema.addresses.kodepos.kodepos, `%${query_substr}%`), eq(Schema.addresses.kodepos.kelurahan_id, kelurahan_id))
                )
                .limit(MAX_RESULT_COUNT)
                .then(async results => {
                    return c.json({
                        status: 'ok',
                        results
                    });
                });
        }
    }
);


export default route_Address;