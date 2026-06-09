import { Router } from "express";
import { body, validationResult } from "express-validator";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  requireAuth,
  requireRoles,
  AuthedRequest,
} from "../middleware/auth.js";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  const sort = (req.query.sort as string) ?? "date";
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};
  if (category) where.category = { contains: category };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { clubName: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const orderBy =
    sort === "name"
      ? { name: "asc" as const }
      : sort === "category"
        ? { category: "asc" as const }
        : { date: "desc" as const };

  const events = await prisma.event.findMany({
    where,
    orderBy,
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { media: true, albums: true } },
    },
  });

  res.json(events);
});

eventsRouter.get("/:id", async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      albums: { include: { _count: { select: { media: true } } } },
    },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

eventsRouter.post(
  "/",
  requireAuth,
  requireRoles(Role.ADMIN, Role.PHOTOGRAPHER, Role.CLUB_MEMBER),
  body("name").trim().notEmpty(),
  body("date").isISO8601(),
  body("category").trim().notEmpty(),
  body("clubName").trim().notEmpty(),
  async (req: AuthedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, date, category, clubName, isPublic } = req.body;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        category,
        clubName,
        isPublic: isPublic ?? true,
        createdById: req.user!.id,
        albums: { create: { name: "Main Album" } },
      },
      include: { albums: true },
    });

    res.status(201).json(event);
  }
);

eventsRouter.post(
  "/:id/albums",
  requireAuth,
  requireRoles(Role.ADMIN, Role.PHOTOGRAPHER, Role.CLUB_MEMBER),
  body("name").trim().notEmpty(),
  async (req: AuthedRequest, res) => {
    const album = await prisma.album.create({
      data: { name: req.body.name, eventId: req.params.id },
    });
    res.status(201).json(album);
  }
);

eventsRouter.patch(
  "/:id",
  requireAuth,
  requireRoles(Role.ADMIN, Role.PHOTOGRAPHER),
  async (req: AuthedRequest, res) => {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(event);
  }
);

eventsRouter.delete(
  "/:id",
  requireAuth,
  requireRoles(Role.ADMIN),
  async (req, res) => {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);
