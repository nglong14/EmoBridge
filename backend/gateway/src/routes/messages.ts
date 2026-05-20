import { Router } from "express";

import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

// GET /api/messages — returns the authenticated user's persisted messages
messagesRouter.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.message.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    const messages = rows.map((row) => ({
      id: row.id,
      role: row.role.toLowerCase() as "user" | "assistant",
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    }));

    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/messages — clears all messages for the authenticated user
messagesRouter.delete("/", async (req, res, next) => {
  try {
    await prisma.message.deleteMany({
      where: { userId: req.user!.id },
    });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});
