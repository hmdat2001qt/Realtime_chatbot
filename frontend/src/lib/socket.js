// lib/socket.js
import { io } from "socket.io-client";

export const socket = io(import.meta.env.MODE === "development"? "http://localhost:5001": "/graphql", {
  withCredentials: true,
});
