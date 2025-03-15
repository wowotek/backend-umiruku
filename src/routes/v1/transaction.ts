import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import API from '../../apis';
import { TCustomer } from '../../database/schemas/customers';
import { TDeliveryPlan, TFullProductPrice, TProduct, TProductPrice } from '../../database/schemas/products';
import { TInvoice, TInvoiceItems } from '../../database/schemas/transactions';


const route_Transaction = new Hono();

// GET
route_Transaction.get(
    '/account-number',
    async (c) => {
        return c.json({
            status: 'ok',
            result: {
                bank: 'XXX',
                account_number: '1234567890',
                account_name: 'John Doe'
            }
        })
    }
);

route_Transaction.post(
    '/invoice',
    zValidator('json', z.object({
        customer_id: z.number().int().min(1),
        product_id: z.number().int().min(1),
        delivery_plan_id: z.number().int().min(1)
    })),
    async (c) => {
        const req = c.req.valid('json');
        const invoice = await API.Transaction.createNewInvoice(req.customer_id, req.product_id, req.delivery_plan_id);
        if (invoice.status !== 'ok') {
            console.error("createNewInvoice", invoice.result);
            return c.json({ status: 'error', result: invoice.result })
        }

        return c.json({ status: 'ok', result: invoice.result })
    }
);

route_Transaction.get(
    '/invoice/:invoice_id',
    zValidator('param', z.object({
        invoice_id: z.number().int().min(1)
    })),
    async (c) => {
        const invoice_id = c.req.valid('param').invoice_id;
        const invoice = await API.Transaction.getInvoiceById(invoice_id);
        if (invoice.status !== 'ok') {
            console.error("getInvoiceById", invoice.result);
            return c.json({ status: 'error', result: invoice.result })
        }

        return c.json({ status: 'ok', result: invoice.result })
    }
)

route_Transaction.get(
    '/invoices',
    async (c) => {
        const count = parseInt(c.req.query('count') ?? '25');
        const invoices = await API.Transaction.getInvoicesByCount(count);
        if (invoices.status !== 'ok') {
            console.error("getAllInvoices", invoices.result);
            return c.json({ status: 'error', result: invoices.result })
        }

        return c.json({ status: 'ok', result: invoices.result })
    }
)

route_Transaction.get(
    '/invoices/range',
    async (c) => {
        const id_min = parseInt(c.req.query('id_start') ?? '-1');
        const id_max = parseInt(c.req.query('id_end') ?? '-1');
        if (id_min === -1) return c.json({ 
            status: 'error',
            result: 'id_min must be provided' 
        });

        if (id_max === -1) return c.json({
            status: 'error',
            result: 'id_max must be provided' 
        });

        const invoices_res = await API.Transaction.getInvoicesByIdRange(id_min, id_max);
        if (invoices_res.status !== 'ok') {
            console.error("getInvoicesByMinMaxId", invoices_res.result);
            return c.json({ status: 'error', result: invoices_res.result })
        }

        const invoices = invoices_res.result as TInvoice[];
        const joined = await Promise.all(invoices.map(async invoice => {
            const customer_res = await API.Customer.getOneById(invoice.customer_id);
            if (customer_res.status !== 'ok') {
                console.error("getCustomerById", customer_res.result);
                return null;
            }

            const invoice_items_res = await API.Transaction.getInvoiceItemsByInvoiceId(invoice.id);
            if (invoice_items_res.status !== 'ok') {
                console.error("getInvoiceItemsByInvoiceId", invoice_items_res.result);
                return null;
            }

            const invoice_items = invoice_items_res.result as TInvoiceItems[];

            return {
                ...invoice,
                customer: customer_res.result as TCustomer,
                items: invoice_items
            }
        }));


        return c.json({
            status: 'ok',
            result: joined
        })
    }
)

export default route_Transaction;