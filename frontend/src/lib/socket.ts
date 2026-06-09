import { io, Socket } from "socket.io-client";
import { API_ORIGIN } from "./config";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    const url = API_ORIGIN || window.location.origin;
    socket = io(url, { auth: { token }, autoConnect: true });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
