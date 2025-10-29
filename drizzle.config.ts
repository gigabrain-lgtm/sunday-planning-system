import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Add sslmode=no-verify for production to handle self-signed certificates
const dbUrl = process.env.NODE_ENV === 'production' && !connectionString.includes('sslmode')
  ? `${connectionString}${connectionString.includes('?') ? '&' : '?'}sslmode=no-verify`
  : connectionString;

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
