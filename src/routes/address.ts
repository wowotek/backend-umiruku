import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import * as DBAddress from '../database/schema';
import db from '../database/__database__';
import { gte, lte, and } from 'drizzle-orm';


const route_Address = new Hono();


route_Address.get(
    '/', 
    zValidator('json', z.object({
        idStart: z.number(),
        idEnd: z.number(),
    })),
    async (c) => {
        const request = c.req.valid('json');

        return db.select().from(DBAddress.provinsi)
            .where(
                and(
                    gte(DBAddress.provinsi.id, request.idStart),
                    lte(DBAddress.provinsi.id, request.idEnd)
                )
            )
            .then(async results => c.json({
                success: true,
                data: results
            }))
    }
);

export default route_Address;