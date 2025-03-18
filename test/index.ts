import { beforeAll } from "bun:test";
import Schema from "../src/database/schemas";
import { mysqlTable } from "drizzle-orm/mysql-core";


const test_provinsi = mysqlTable("test_provinsi", Schema.addresses.tblDefProvinsi)
const test_kabupaten = mysqlTable("test_kabupaten", Schema.addresses.tblDefKabupaten)
const test_kecamatan = mysqlTable("test_kecamatan", Schema.addresses.tblDefKecamatan)
const test_kelurahan = mysqlTable("test_kelurahan", Schema.addresses.tblDefKelurahan)
const test_kodepos = mysqlTable("test_kodepos", Schema.addresses.tblDefKodepos)
const test_enabledKecamatan = mysqlTable("test_enabledKecamatan", Schema.addresses.tblDefEnabledKecamatan)

const test_customers = mysqlTable("test_customers", Schema.customers.tblDefCustomer)

const test_files = mysqlTable("test_files", Schema.files.tblDefFiles)

const test_product = mysqlTable("test_product", Schema.product.tblDefProduct)
const test_productPrice = mysqlTable("test_productPrice", Schema.product.tblDefProductPrice)
const test_deliveryPlan = mysqlTable("test_deliveryPlan", Schema.product.tblDefDeliveryPlan)

const test_invoiceItems = mysqlTable("test_invoiceItems", Schema.transactions.tblDefInvoiceItems)
const test_invoice = mysqlTable("test_invoice", Schema.transactions.tblDefInvoice)
const test_customerSubscription = mysqlTable("test_customerSubscription", Schema.transactions.tblDefCustomerSubscription)

const test_users = mysqlTable("test_users", Schema.users.tblDefUser);