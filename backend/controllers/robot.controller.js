import asyncHandler from "express-async-handler";
import rosController from "../utils/rosClient.js";
import AppError from "../utils/error.js";
import Tour from "../models/tour.model.js";

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

export const readClientsCount = asyncHandler(async (req, res, next) => {
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

export const sendGeneratedAudio = asyncHandler(async (req, res, next) => {
  if (rosController.isAuthenticated) {
    try {
      const audioPath =
        "/home/lailaebrahim/Robotic-Tour-Guide-Dashboard/trails/received_audio/received_audio/1.wav";
      await rosController.streamAudioFile(audioPath);
      const tour = await Tour.findById(req.params.id);
      tour.isAudioStreamed = true;
      await tour.save();
      res.status(200).jsend.success({ message: "Audio sent" });
    } catch (error) {
      res.status(500).jsend.error({
        message: "Failed to send audio",
        error: error.message,
      });
    }
  } else {
    return next(new AppError(401, "Not Auth to ROS"));
  }
});

export const startTour = asyncHandler(async (req, res, next) => {
  const tourId = req.params.id;

  // check if tour exists
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError(404, "Tour not found"));
  }

  // check if audio is generated
  if (
    !tour.isAudioGenerated &&
    !Object.values(tour.museumMap).every((poi) => poi.audio != null)
  ) {
    return next(new AppError(400, "Generate Tour Audio First!"));
  }

  // check ROS connection & authentication
  if (!rosController.isAuthenticated) {
    return next(new AppError(401, "Not Authorized to ROS"));
  }

  // check robot state
  if (rosController.state !== "at home") {
    return next(
      new AppError(400, "Can't Start A New Tour While Robot Not At Home")
    );
  }

  console.log("all checks passed, starting tour");

  // get all POI audios paths
  const audios = Object.values(tour.museumMap).map((poi) => {
    const dirPath = fileURLToPath(dirname(import.meta.url));
    const outputFilePath = join(dirPath, `../../../${process.env.PUBLIC_PATH}/${poi.audio}`);
    return outputFilePath;
  });

  console.log(audios);

  // send audios sequentially
  for (const audio of audios) {
    console.log(audio);
    const result = await rosController.streamAudioFile(audio);
    if (result instanceof Error) {
      return next(new AppError(500, `Failed to send audio: ${result.message}`));
    }
  }

  // if all audios were sent successfully
  const startResult = await rosController.sendStartTourSignal();

  res.status(200).json({
    status: "success",
    message: "Tour started successfully",
    data: {
      tourId: tour._id,
      numberOfPOIs: audios.length,
    },
  });
});
