import { Server } from "socket.io";
import { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

let io: Server | null = null;

export function setSocketServer(server: Server) {
  io = server;
}

export async function createNotification(params: {
  userId: string;
  actorId?: string;
  type: NotificationType;
  message: string;
  mediaId?: string;
}) {
  const notification = await prisma.notification.create({ data: params });
  io?.to(`user:${params.userId}`).emit("notification", notification);
  return notification;
}
