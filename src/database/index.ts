import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";


export const controller = drizzle(process.env.DATABASE_URL!);

export default controller;