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


class ROSController {
  constructor() {
    this.ros = new ROS.Ros();
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 5000;
    this.isReconnecting = false;
    this.isAuthenticated = false;
    this.setupEventHandlers();
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

  createTopic(name, messageType) {
    return new ROS.Topic({
      ros: this.ros,
      name,
      messageType,
    });
  }
}

const rosController = new ROSController();
export default rosController;
