import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

export const shareRouter = Router();

/** Bonus: QR-friendly share link for an event album */
shareRouter.get("/event/:id/qr-url", async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const url = `${env.clientUrl}/events/${event.id}`;
  res.json({
    eventId: event.id,
    eventName: event.name,
    shareUrl: url,
    qrHint: `Encode this URL as QR: ${url}`,
  });
});
