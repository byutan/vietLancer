import dotenv from "dotenv";
dotenv.config(); // Load environment variables first

import app from './routes/app.js';
import pool from "./config/db.js"; // This imports the live pool object directly

const startServer = async () => {
  try {
    // Step 1: Test the connection (Optional but recommended)
    // We run a simple query to make sure the DB is accessible
    const connection = await pool.getConnection();
    console.log("Kết nối database thành công!");
    connection.release(); // Always release the connection back to the pool

    // Step 2: Start the server only if DB is connected
    app.listen(process.env.PORT, function () {
      console.log('Your app running on port ' + process.env.PORT);
    });

  } catch (error) {
    console.error("Không thể kết nối đến database. Server dừng lại.");
    console.error(error.message);
    process.exit(1); // Stop the process if DB fails
  }
};

startServer();