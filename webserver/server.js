import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import app from "./routes/app.js";
import contractRoutes from "./routes/api/contract.js"; 

const server = express();

server.use(cors());
server.use(express.json());

server.use("/", app);
server.use("/api/contract", contractRoutes);
server.listen(process.env.port, function () {
  console.log("Your app running on port " + process.env.port);
});
