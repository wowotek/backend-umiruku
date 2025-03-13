import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/database/schemas/index.ts',
    './src/database/schemas/addresses.ts',
    './src/database/schemas/customers.ts',
    './src/database/schemas/files.ts',
    './src/database/schemas/products.ts',
    './src/database/schemas/transactions.ts',
    './src/database/schemas/users.ts',
  ],
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});