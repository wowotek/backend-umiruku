import { Hono } from 'hono';

import route_Address from "./address";
import route_Users from './users';
import route_Customer from './customer';
import route_Product from './product';

const route_v1 = new Hono();
route_v1.route('/address', route_Address);
route_v1.route("/users", route_Users);
route_v1.route("/customer", route_Customer);
route_v1.route("/product", route_Product);

export default route_v1;