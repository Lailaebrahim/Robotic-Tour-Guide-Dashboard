import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api";
const WS_URL = "ws://localhost:5000"; // Your WebSocket URL

axios.defaults.withCredentials = true;

const robotStore = create((set, get) => ({
  // State
  isConnected: false,
  isAuth: false,
  isConnecting: false,
  isLoading: false,
  error: null,
  state: null,
  socket: null,
  position: null,

  // WebSocket Actions
  connectWebSocket: () => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("WebSocket Connected");
      set({ socket });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle different types of messages
      switch (data.type) {
        case "robot_status": {
          set({
            state: data.data,
          });
          break;
        }

        case "amcl_pose": {
          set({
            position: {
              x: data.data.x,
              y: data.data.y,
              z: data.data.z,
              w: data.data.w,
            },
          });
          break;
        }

        case "error": {
          set({ error: data.message });
          break;
        }

        default:
          console.log("Unhandled message type:", data.type);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
      set({
        socket: null,
        isConnected: false,
      });

      // Attempt to reconnect after delay
      setTimeout(() => {
        if (!get().socket) {
          get().connectWebSocket();
        }
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      set({ error: "WebSocket connection error" });
    };
  },

  // Disconnect WebSocket
  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },

  // Send message through WebSocket
  sendCommand: (command) => {
    const { socket } = get();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "command",
          data: command,
        })
      );
    } else {
      set({ error: "WebSocket not connected" });
    }
  },

  // HTTP Actions
  checkConnection: async () => {
    set({ isLoading: true, error: null });
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/robot/connection-status`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      set({
        isConnected: response.data.data.status,
        isAuth: response.data.data.authentication,
        isLoading: false,
        error: null,
      });

      // Establish WebSocket connection after successful HTTP check
      if (!get().socket) {
        get().connectWebSocket();
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  //
  startTour: async (tourId) => {
    // set({ isLoading: true, error: null });
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_URL}/robot/start-tour/${tourId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      set({ isLoading: false, error: null });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.data?.message || "Internal Server Error";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  // Cleanup
  cleanup: () => {
    get().disconnectWebSocket();
    set({
      isConnected: false,
      isAuth: false,
      isConnecting: false,
      isLoading: false,
      error: null,
      state: "config",
      socket: null,
      robotData: null,
    });
  },
}));

export default robotStore;