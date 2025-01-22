/**
 * @file rosClient.js
 * @description This module provides the ROSController class for managing ROS (Robot Operating System) connections, authentication, and reconnection logic.
 */

/**
 * @class ROSController
 * @classdesc Manages the connection, authentication, and reconnection logic for ROS (Robot Operating System).
 * @property {ROS.Ros} ros - The ROS connection instance.
 * @property {number} connectionAttempts - The number of connection attempts made.
 * @property {number} maxReconnectAttempts - The maximum number of reconnection attempts allowed.
 * @property {number} reconnectInterval - The interval (in milliseconds) between reconnection attempts.
 * @property {boolean} isReconnecting - Indicates whether the controller is currently attempting to reconnect.
 * @property {boolean} isAuthenticated - Indicates whether the controller is authenticated with the ROS server.
 * @property {NodeJS.Timeout|null} reconnectTimer - The timer for managing reconnection attempts.
 */
import ROS from "roslib";
import fs from "fs";
import {wss} from "../index.js";
import WebSocket from "ws";

class ROSController {
  constructor() {
    this.ros = new ROS.Ros();
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 100;
    this.reconnectInterval = 5000;
    this.isReconnecting = false;
    this.isAuthenticated = false;
    this.setupEventHandlers();
    this.state = "at home";
  }

  setupEventHandlers() {
    this.ros.on("connection", async () => {
      try {
        await this.ros.authenticate(
          process.env.ROSBRIDGE_MAC,
          "client",
          "dest",
          "rand",
          0,
          "level",
          0
        );
        // to disconnect the client if not authenticated
        await this.verifyConnection();
        this.isAuthenticated = true;
        this.connectionAttempts = 0;
        this.isReconnecting = false;
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        console.log("Successfully authenticated with ROS");
        this.stateSubscriber();
        this.amclPoseSubscriber();
      } catch (error) {
        console.error("Authentication failed:", error);
        this.ros.close();
      }
    });

    this.ros.on("error", (error) => {
      console.log(`Error: ${JSON.stringify(error.message)}`);
    });

    this.ros.on("close", () => {
      // if the connection is closed by the server try to reconnect
      console.log("Disconnected from ROS!");
      this.isAuthenticated = false;
      this.handleReconnection();
    });

    this.ros.on("amcl_pose", (message) => {
      console.log("Received AMCL Pose:", message);
    });
  }

  async verifyConnection() {
    // verification by trying to get topics
    // if the client is connected but not authenticated the rosbridge_server will close the connection
    try {
      await new Promise((resolve, reject) => {
        this.ros.getTopics(
          (topics) => resolve(topics),
          (error) => reject(error)
        );
      });
    } catch (error) {
      throw new Error("Not Authenticated or Not Connected");
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      // protect from hanging connections
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 5000);

      // on connection handler
      const connectionHandler = () => {
        clearTimeout(timeout);
        resolve();
      };

      // on error handler
      const errorHandler = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      try {
        // wait for actual connection then remove the handlers
        // then return a resolved promise only after actual connection success or fail
        // as await this.ros.connect() will not throw an error if the connection fails
        // and will resolve after sending the connection request not after the actual connection
        this.ros.once("connection", connectionHandler);
        this.ros.once("error", errorHandler);

        this.ros.connect(process.env.ROSBRIDGE_SERVER_URL);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  handleReconnection() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    const reconnect = async () => {
      // stop reconnection if max attemps reaced
      if (this.connectionAttempts >= this.maxReconnectAttempts) {
        console.log("Max reconnection attempts reached");
        this.isReconnecting = false;
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        return;
      }

      try {
        // try to reconnect
        console.log(
          `Attempting to reconnect. Attempt #${this.connectionAttempts}`
        );
        this.connectionAttempts++;
        await this.connect();
      } catch (error) {
        console.log(`Reconnection failed: ${error.message || error}`);
        this.connectionAttempts++;
      }
    };

    // start reconnection timer
    this.reconnectTimer = setInterval(reconnect, this.reconnectInterval);
  }

  async streamAudioFile(filePath, chunkSize = 16384) {
    // 16KB chunks
    const DEBUG = true; // Debug flag - easily toggle debugging

    // Debug logging helper
    const debug = (message, data = null) => {
      if (DEBUG) {
        if (data) {
          console.log(`[AudioStream] ${message}`, data);
        } else {
          console.log(`[AudioStream] ${message}`);
        }
      }
    };

    try {
      debug(`Starting audio stream for file: ${filePath}`);
      debug(`Using chunk size: ${chunkSize} bytes`);

      // Initialize counters for debugging
      let totalChunks = 0;
      let totalBytes = 0;
      const startTime = Date.now();

      // Audio publisher using sensor_msgs/Audio
      debug("Initializing audio publisher");
      this.audioPublisher = new ROS.Topic({
        ros: this.ros,
        name: "/audio_stream",
        messageType: "audio_common_msgs/AudioData",
      });

      // Publisher for audio metadata
      debug("Initializing metadata publisher");
      this.metadataPublisher = new ROS.Topic({
        ros: this.ros,
        name: "/audio_metadata",
        messageType: "std_msgs/String",
      });

      // Subscriber for save complete signal
      debug('Initializing save complete subscriber');
      this.saveCompleteSubscriber = new ROS.Topic({
        ros: this.ros,
        name: "/audio_save_complete",
        messageType: "std_msgs/String"
      });

      debug('Setting up save complete listener');
      // Add a timeout to prevent indefinite waiting
      const TIMEOUT_MS = 5000; // 5 second timeout

      const setupSubscriber = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          debug("Subscriber setup timed out - proceeding with stream");
          resolve("timeout");
        }, TIMEOUT_MS);

        this.saveCompleteSubscriber.subscribe((message) => {
          debug("Received subscriber message:", message);
          if (message.data === "done saving") {
            // Note: checking message.data instead of message
            clearTimeout(timeout);
            debug("Received done saving signal");
            resolve("done saving");
          }
        });
      });

      // Wait for subscriber setup or timeout
      await setupSubscriber;

      // Send metadata first
      debug("Reading file stats");
      const stats = fs.statSync(filePath);
      const metadata = {
        fileName: filePath.split("/").pop(),
        fileSize: stats.size,
        timestamp: new Date().toISOString(),
        chunkSize: chunkSize,
        expectedChunks: Math.ceil(stats.size / chunkSize),
      };

      debug("Publishing metadata", metadata);
      this.metadataPublisher.publish(
        new ROS.Message({
          data: JSON.stringify(metadata),
        })
      );

      // Create read stream
      debug("Creating read stream");
      const stream = fs.createReadStream(filePath, {
        highWaterMark: chunkSize,
      });

      // Process stream
      debug("Starting chunk processing");
      for await (const chunk of stream) {
        totalChunks++;
        totalBytes += chunk.length;

        debug(`Processing chunk ${totalChunks}`, {
          chunkSize: chunk.length,
          totalBytesProcessed: totalBytes,
          percentComplete: ((totalBytes / stats.size) * 100).toFixed(2) + "%",
        });

        const message = new ROS.Message({
          data: Array.from(chunk), // Convert Buffer to array for ROS
        });

        try {
          this.audioPublisher.publish(message);
          debug(`Published chunk ${totalChunks} successfully`);
        } catch (publishError) {
          debug(`Error publishing chunk ${totalChunks}:`, publishError);
          throw publishError;
        }

        // Small delay to prevent overwhelming network
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Send end marker
      debug("Sending end marker");
      this.audioPublisher.publish(
        new ROS.Message({
          data: [], // Empty array signals end of stream
        })
      );

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds

      debug("Stream completed successfully", {
        totalChunks,
        totalBytes,
        duration: `${duration.toFixed(2)}s`,
        averageSpeed: `${(totalBytes / 1024 / 1024 / duration).toFixed(
          2
        )} MB/s`,
      });
    } catch (error) {
      debug("Fatal error in audio streaming:", error);
      debug("Error stack trace:", error.stack);

      // Attempt to clean up resources
      try {
        if (this.audioPublisher) {
          debug("Attempting to close audio publisher");
          this.audioPublisher.unsubscribe();
        }
        if (this.metadataPublisher) {
          debug("Attempting to close metadata publisher");
          this.metadataPublisher.unsubscribe();
        }
        if (this.saveCompleteSubscriber) {
          debug("Attempting to close save complete subscriber");
          this.saveCompleteSubscriber.unsubscribe();
        }
      } catch (cleanupError) {
        debug("Error during cleanup:", cleanupError);
      }

      return error;
    }
  }

  async stateSubscriber() {
    const stateSubscriber = new ROS.Topic({
      ros: this.ros,
      name: "/robot_status",
      messageType: "std_msgs/String"
    });
    const state = await new Promise((resolve, reject) => {
      stateSubscriber.subscribe((message) => {
        console.log("Received Robot State:", message);
        this.state = message.data;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "robot_status", data: message.data })
            );
          }
        });
      });
    });

    return state;
  }

  async amclPoseSubscriber() {
    const amclPoseSubscriber = new ROS.Topic({
      ros: this.ros,
      name: "/amcl_pose",
      messageType: "geometry_msgs/PoseWithCovarianceStamped"
    });
    const pose = await new Promise((resolve, reject) => {
      amclPoseSubscriber.subscribe((message) => {
        console.log("Received AMCL Pose:", message);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "amcl_pose", data: message.data })
            );
          }
        });
        resolve(message);
      });
    });

    return pose;
  }

  async sendStartTourSignal() {
    return new Promise((resolve, reject) => {
      // publisher for start signal
      const startSignalPub = new ROS.Topic({
        ros: this.ros,
        name: "/start_tour_signal",
        messageType: "std_msgs/String",
      });

      // subscriber for tour status confirmation
      const tourStatusSub = new ROS.Topic({
        ros: this.ros,
        name: "/robot_status",
        messageType: "std_msgs/String",
      });

      // Set timeout for response
      const timeout = setTimeout(() => {
        tourStatusSub.unsubscribe();
        reject(new Error("Timeout waiting for tour start confirmation"));
      }, 10000); // 10 second timeout

      // Subscribe to tour status
      tourStatusSub.subscribe((message) => {
        if (message.data === "tour_started") {
          clearTimeout(timeout);
          tourStatusSub.unsubscribe();
          resolve({ status: "success", message: "Tour started successfully" });
        } else if (message.data === "tour_start_failed") {
          clearTimeout(timeout);
          tourStatusSub.unsubscribe();
          reject(new Error("Failed to start tour"));
        }
      });

      // Publish start signal
      const startMsg = new ROS.Message({
        data: "start_tour",
      });

      try {
        startSignalPub.publish(startMsg);
      } catch (error) {
        clearTimeout(timeout);
        tourStatusSub.unsubscribe();
        reject(new Error(`Failed to publish start signal: ${error.message}`));
      }
    });
  }

  /* to be continued */
  // async sendGoToCommand(POI) {
  //   const cmd_vel_publisher = new ROS.Topic({
  //     ros: this.ros,
  //     name: "/cmd_vel",
  //     messageType: "geometry_msgs/PoseWithCovarianceStamped"
  //   });

  //   const message = new ROS.Message({
  //     data: POI
  //   });

  // }

  async sendMoveCommand(command) {
    console.log("Received move command:", command);
    // const cmd_vel_publisher = new ROS.Topic({
    //       ros: this.ros,
    //       name: "/cmd_vel",
    //       messageType: "geometry_msgs/PoseWithCovarianceStamped"
    //     });

    //     let message;
    //     switch (command) {
    //       case "forward":
    //         message = new ROS.Message({});
    //         break;
    //       case "backward":
    //         message = new ROS.Message({});
    //         break;
    //       case "left":
    //         message = new ROS.Message({});
    //         break;
    //       case "right":
    //         message = new ROS.Message({});
    //         break;
    //       case "stop":
    //         message = new ROS.Message({});
    //         break;
    //       default:
    //         console.log("Invalid command");
    //         break;
    //     }

    //     try {
    //       cmd_vel_publisher.publish(message);
    //     } catch (error) {
    //       console.error("Failed to send move command:", error);
    //     }

  }

}

const rosController = new ROSController();
export default rosController;