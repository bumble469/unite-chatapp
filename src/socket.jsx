import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL;

export const socket = io(apiUrl, {
  autoConnect: false,
});

