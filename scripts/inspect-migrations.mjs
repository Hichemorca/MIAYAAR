import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.query("SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY id ASC");
console.log(JSON.stringify(rows, null, 2));
await connection.end();
