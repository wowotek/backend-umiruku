import { Hono } from 'hono';

import route_Address from "./v1/address";

const route_v1 = new Hono();
route_v1.route('/address', route_Address);

export default {
    v1: route_v1
};