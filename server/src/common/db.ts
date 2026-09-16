import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`FATAL: Environment variable ${envVar} is missing!`);
  }
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
