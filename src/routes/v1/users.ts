import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { eq } from 'drizzle-orm';

import DBController from '../../database/database';
import DBSchema from '../../database/schema';



const route_Users = new Hono();

const MAX_RESULT_COUNT = 25;

// GET user by username
route_Users.get(
    '/username',
    async (c) => {
        const username = c.req.query('username') ?? "";

        return DBController.select().from(DBSchema.users)
            .where(
                eq(DBSchema.users.username, username)
            )
            .limit(MAX_RESULT_COUNT)
            .then(async results => {
                for(const result of results) {
                    result.password = "****";
                }

                return c.json({
                    status: 'ok',
                    results
                });
            });
    }
);

// GET user by id
route_Users.get(
    '/id',
    async (c) => {
        const id = parseInt(c.req.query('id') ?? "-1");

        return DBController.select().from(DBSchema.users)
            .where(
                eq(DBSchema.users.id, id)
            )
            .limit(MAX_RESULT_COUNT)
            .then(async results => {
                for(const result of results) {
                    result.password = "****";
                }

                return c.json({
                    status: 'ok',
                    results
                });
            });
    }
);

export default route_Users;