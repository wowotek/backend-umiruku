import { Hono } from 'hono';
import { cors } from 'hono/cors'

import routes from './routes';


const app = new Hono()

app.use("/*", cors());
app.get('/', (c) => {
    return c.text('Hello Hono!');
});

app.route('/v1', routes.v1);

export default app;