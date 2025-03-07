import { Hono } from 'hono';

import route_Address from "./v1/address";
import route_Users from './v1/users';
import route_Customer from './v1/customer';

const route_v1 = new Hono();
route_v1.route('/address', route_Address);
route_v1.route("/users", route_Users);
route_v1.route("/customer", route_Customer);

export default {
    v1: route_v1
};