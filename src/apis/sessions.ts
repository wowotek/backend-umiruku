import { eq } from 'drizzle-orm';
import DBController from '../database';
import Schema from "../database/schemas";
import { TSession } from '../database/schemas/users';

const SESSION_TOKEN = new Array<string>();
const SESSIONS = new Array<TSession>();

// Populate Cache
setTimeout(async () => {
    const sessions = await DBController.select()
        .from(Schema.users.sessions)
        .then(async results => results)
        .catch(async err => {
            console.error("getSessions", err);
            return [];
        });

    SESSIONS.push(...sessions);
    SESSION_TOKEN.push(...sessions.map(s => s.token));
}, 1000);

// 

export const getSessionById = async (id: number) => await DBController.select()
    .from(Schema.users.sessions)
    .where(
        eq(Schema.users.sessions.id, id)
    )
    .limit(1)
    .then(async results => results.length > 0 ? results[0] : null)
    .catch(async err => {
        console.error("getSessionById", err);
        return null;
    });

