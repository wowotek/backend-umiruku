import { drizzle } from "drizzle-orm/mysql2";


export const controller = drizzle({ connection: {
    // I DON'T CARE, JUST HARD CODE IT FOR NOW
    uri: "",
    database: "umiruku"
}});

export default controller;