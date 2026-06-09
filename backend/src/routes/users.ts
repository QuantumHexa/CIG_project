import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.get("/search", requireAuth, async (req, res) => {
  const q = String(req.query.q ?? "");
  const users = await prisma.user.findMany({
    where: q
      ? { name: { contains: q } }
      : undefined,
    take: 20,
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(users);
});
