/**
 * @fileoverview Entry point for the Robotic Tour Guide Dashboard backend server.
 * Sets up the Express server, middleware, and routes.
 *
 * @requires express
 * @requires dotenv
 * @requires jsend
 * @requires cookie-parser
 */
import express from "express";
import dotenv from "dotenv";
import jsend from "jsend";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error/errorHandler.js";
import DBClient from "./utils/dbClient.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";

// express application instance
const app = express();

// add env variables to process.env
dotenv.config();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(jsend.middleware);

// routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// route handler for undefined routes
app.use("*", (_, res) => {
  res.status(404).jsend.fail({ message: "Url Not Found" });
});

// error handler
app.use(errorHandler);

// starts the server and listens on the specified port
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  new DBClient();
});
