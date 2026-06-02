import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { validate } from "../middleware/validate.js";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

const conversationSelect = {
  id: true,
  title: true,
  createdAt: true,
  updatedAt: true,
} as const;

const idParamsSchema = z.object({ id: z.string().min(1) });
type IdParams = z.infer<typeof idParamsSchema>;

const createSchema = z.object({
  title: z.string().min(1).optional(),
});

const renameSchema = z.object({
  title: z.string().min(1),
});

const messagesSelect = {
  id: true,
  role: true,
  content: true,
  createdAt: true,
} as const;

// GET /api/conversations — list conversations for the authenticated user, newest first
conversationsRouter.get("/", async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: "desc" },
      select: conversationSelect,
    });
    return res.json({ conversations });
  } catch (err) {
    return next(err);
  }
});

// POST /api/conversations — create a new empty conversation
conversationsRouter.post("/", validate({ body: createSchema }), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSchema>;
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user!.id,
        title: body.title ?? "New chat",
      },
      select: conversationSelect,
    });
    return res.status(201).json({ conversation });
  } catch (err) {
    return next(err);
  }
});

// GET /api/conversations/:id/messages — get messages for a specific conversation
conversationsRouter.get("/:id/messages", validate({ params: idParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as IdParams;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!conversation) return next(new AppError("Conversation not found", 404));
    if (conversation.userId !== req.user!.id) return next(new AppError("Conversation not found", 404));

    const rows = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      select: messagesSelect,
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

// PATCH /api/conversations/:id — rename a conversation
conversationsRouter.patch("/:id", validate({ params: idParamsSchema, body: renameSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as IdParams;
    const body = req.body as z.infer<typeof renameSchema>;

    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) return next(new AppError("Conversation not found", 404));
    if (existing.userId !== req.user!.id) return next(new AppError("Conversation not found", 404));

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { title: body.title },
      select: conversationSelect,
    });

    return res.json({ conversation });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/conversations/:id — delete a conversation and its messages
conversationsRouter.delete("/:id", validate({ params: idParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as IdParams;

    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) return next(new AppError("Conversation not found", 404));
    if (existing.userId !== req.user!.id) return next(new AppError("Conversation not found", 404));

    await prisma.conversation.delete({ where: { id } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});
