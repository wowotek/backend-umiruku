import { Hono } from 'hono';


const app = Hono();


interface Table {
    id: number;

    created_at: Date;
    last_updated: Date;
    deleted_at?: Date; // null if not deleted
    is_deleted: boolean;
}

type Customer = Table & {
    fullname: string;
    phone_number: string;
    email?: string;

    provinsi_id : number;
    kabupaten_id: number;
    kecamatan_id: number;
    kelurahan_id: number;
    kodepos_id  : number;

    full_address: string;
    coord_lati: number;
    coord_long: number;
};

type Subscription = Table & {
    customer_id
};