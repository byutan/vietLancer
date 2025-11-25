import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Create the pool immediately. 
// mysql2 manages connections, so you don't need to wrap this in an async function.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA),
    rejectUnauthorized: true
  }
});

console.log("Cấu hình database đã tải (Connection pool created).");

// Export the pool as DEFAULT so 'import pool from ...' works
export default pool;