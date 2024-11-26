import asyncHandler from "express-async-handler";
import rosController from "../utils/rosClient.js";
import AppError from "../utils/error.js";


export const getConnectionStatus = asyncHandler(async (req, res) => {
  res.status(200).jsend.success({
    status: rosController.ros.isConnected,
    reconnecting: rosController.isReconnecting,
    authentication: rosController.isAuthenticated,
    connectionAttempts: rosController.connectionAttempts,
  });
});

export const getTopics = asyncHandler(async (req, res, next) => {
  if (rosController.isAuthenticated) {
    try {
      const topics = await new Promise((resolve, reject) => {
        rosController.ros.getTopics(
          (topics) => resolve(topics),
          (error) => reject(error)
        );
      });
      res.status(200).jsend.success({ topics });
    } catch (error) {
      res.status(500).jsend.error({
        message: "Failed to fetch topics",
        error: error.message,
      });
    }
  } else {
    return next(new AppError(401, "Not Auth to ROS"));
  }
});

export const readClientsCount = asyncHandler(async (req, res) => {
  if (rosController.isAuthenticated) {
    try {
      const clientsCountSubscriber = rosController.createTopic(
        "/client_count",
        "std_msgs/Int32"
      );

      const count = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          clientsCountSubscriber.unsubscribe();
          reject(new Error("Subscription timeout"));
        }, 5000);

        clientsCountSubscriber.subscribe((message) => {
          clearTimeout(timeout);
          clientsCountSubscriber.unsubscribe();
          resolve(message);
        });
      });

      res.status(200).jsend.success({ count: count.data });
    } catch (error) {
      res.status(500).jsend.error({
        message: "Failed to read client count",
        error: error.message,
      });
    }
  } else {
    return next(new AppError(401, "Not Auth to ROS"));
  }
});
