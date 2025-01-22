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
import cors from "cors";
import morgan from "morgan";
import WebSocketServer from "ws";
import errorHandler from "./middlewares/error/errorHandler.js";
import DBClient from "./utils/dbClient.js";
import rosController from "./utils/rosClient.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import robotRouter from "./routes/robot.routes.js";
import tourRoutes from "./routes/tour.routes.js";

// express application instance
const app = express();

// add env variables to process.env
dotenv.config();

// middlewares
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(jsend.middleware);

// routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/robot", robotRouter);
app.use("/api/tours", tourRoutes);

// route handler for undefined routes
app.use("*", (_, res) => {
  res.status(404).jsend.fail({ message: "Url Not Found" });
});

// error handler
app.use(errorHandler);

// starts the server and listens on the specified port
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
 new DBClient();
  // initialize connection
  (async () => {
    try {
      await rosController.connect();
    } catch (error) {
      console.error("Initial connection failed:", JSON.stringify(error.message));
    }
  })();
});

export const wss = new WebSocketServer.Server({ server });
wss.on('connection', (ws) => {
  console.log('New frontend client connected');
  ws.on('close', () => {
    console.log('Frontend client disconnected');
  });
  ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'moveCommand') {
      await rosController.sendMoveCommand(parsedMessage.data);
    }
  });
});