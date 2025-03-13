import { Hono } from 'hono';

import Schema from '../../database/schemas';
import DBController from '../../database';
import { gte, lte, and, like, eq } from 'drizzle-orm';

import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { describeRoute } from 'hono-openapi';
import { TEnabledKecamatan } from '../../database/schemas/addresses';
import { addEnabledKecamatan } from '../../apis/address';


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

//==================================================
// === Management Enabled Kecamatan
//==================================================

// GET, get all Enabled Kecamatan
route_Address.get(
    '/enabled-kecamatan',
    async (c) => {
        const max = parseInt(c.req.query('max') ?? "-1");
        const result = await DBController.select()
            .from(Schema.addresses.enabledKecamatan)
            .innerJoin(Schema.addresses.kecamatan, eq(Schema.addresses.enabledKecamatan.kecamatan_id, Schema.addresses.kecamatan.id))
            .then(async results => results)
            .catch(async err => { throw err });
        
        const rs = new Array<{ id: number, kecamatan_id: number, name: string }>();
        for(const r of result) {
            rs.push({
                id: r.enabled_kecamatan.id,
                kecamatan_id: r.enabled_kecamatan.kecamatan_id,
                name: r.kecamatan.name
            });
        }

        return c.json({
            status: 'ok',
            result: rs
        });
    }
);

// get available target for adding
route_Address.get(
    '/enabled-kecamatan/target-kecamatan',
    async(c) => {
        const query_substr = c.req.query('substr') ?? "";

        const kabupaten_id = await DBController.select()
            .from(Schema.addresses.kabupaten)
            .where(
                eq(Schema.addresses.kabupaten.name, "BOGOR")
            )
            .then(async results => results.length > 0 ? results[0].id : -1)
            .catch(async err => {
                console.error("GET Kabupaten ID", err);
                throw err;
            });
        
        if (kabupaten_id === -1) return c.json({
            status: 'error',
            error: 'Kabupaten ID not found'
        }, 400);

        return await DBController.select()
            .from(Schema.addresses.kecamatan)
            .where(
                and(
                    like(Schema.addresses.kecamatan.name, `%${query_substr}%`),
                    eq(Schema.addresses.kecamatan.kabupaten_id, kabupaten_id)
                )
            )
            .limit(MAX_RESULT_COUNT)
            .then(async results => c.json({
                status: 'ok',
                results
            }))
            .catch(async err => c.json({
                status: 'error',
                error: err
            }, 400));
});

// POST, Add Enabled Kecamatan
route_Address.post(
    '/enabled-kecamatan',
    zValidator('json', z.object(
        {
            kecamatan_id: z.number().int().min(1)
        }
    )),
    async (c) => {
        const request = await c.req.json();
        return await addEnabledKecamatan(request.kecamatan_id)
            .then(async results => c.json({
                status: 'ok',
                result: c.json(results)
            }))
            .catch(async err => c.json({
                status: 'error',
                result: err
            }))
    }
);

// DELETE, Delete Enabled Kecamatan
route_Address.delete(
    '/enabled-kecamatan',
    zValidator('json', z.object(
        {
            kecamatan_id: z.number().int().min(1)
        }
    )),
    async (c) => {
        const kecamatan_id = c.req.valid('json').kecamatan_id;
        
        // check if kecamatan_id is already exists
        const isExists = await DBController.select()
            .from(Schema.addresses.enabledKecamatan)
            .where(
                eq(Schema.addresses.enabledKecamatan.kecamatan_id, kecamatan_id)
            )
            .then(async results => results.length > 0);
        
        if (!isExists) return c.json({
            status: 'error',
            error: 'Kecamatan ID not exists'
        }, 400);

        // delete kecamatan_id
        return DBController.delete(Schema.addresses.enabledKecamatan)
            .where(
                eq(Schema.addresses.enabledKecamatan.kecamatan_id, kecamatan_id)
            )
            .then(async result => {
                return c.json({
                    status: 'ok',
                    result
                }, 200);
            });
    }
);

export default route_Address;