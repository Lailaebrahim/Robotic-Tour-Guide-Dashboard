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
          "19d9d2166799f1ffd6fee6379f957502aff8716bfebc8cc8b3bac57ade14441bb9678be89d0a7eec9c81291f854d754d7a4de2278bede56f162c2faeb468c68a",
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
    } catch (error) { // eslint-disable-line no-unused-vars
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

        this.ros.connect("ws://0.0.0.0:9090");
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

  createMapViewer() {
    const viewer = new window.ROS2D.Viewer({
      divID: "map",
      width: 640,
      height: 30,
    });

    const navClient = new window.NAV2D.OccupancyGridClientNav({
      ros: this.ros,
      rootObject: viewer.scene,
      viewer: viewer,
      serverName: "/move_base",
      withOrientation: true,
    });

    return { viewer, navClient };
  }

}

const rosController = new ROSController();
export default rosController;