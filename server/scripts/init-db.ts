import fs from "fs";
import path from "path";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "shipment_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function runSqlFile(
  client: pkg.PoolClient,
  fileName: string,
): Promise<void> {
  const filePath = path.resolve(__dirname, "../src/db", fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found at path: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`Executing ${fileName}...`);
  await client.query(sql);
}

async function initDb(): Promise<void> {
  const client = await pool.connect();

  try {
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shipments'
      );
    `;

    console.log("Starting database initialization...");

    await client.query("BEGIN");

    await runSqlFile(client, "schema.sql");
    console.log("Schema created successfully.");

    await runSqlFile(client, "seed.sql");
    console.log("Database seeded successfully.");

    await client.query("COMMIT");
    console.log("Database setup completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Database initialization failed. Rolled back changes.",
      error,
    );
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();
