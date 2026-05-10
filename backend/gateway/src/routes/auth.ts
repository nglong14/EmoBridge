import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { validate } from "../middleware/validate.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", validate({ body: registerSchema }), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing !== null) {
      return next(new AppError("Email already registered", 409));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? null },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = signToken({ id: user.id, email: user.email });
    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
});

authRouter.post("/login", validate({ body: loginSchema }), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user === null) {
      return next(new AppError("Invalid email or password", 401));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken({ id: user.id, email: user.email });
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    });
  } catch (err) {
    return next(err);
  }
});

// Stateless logout — the client discards the token.
// A denylist can be added in a future hardening increment.
authRouter.post("/logout", (_req, res) => {
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return next(new AppError("User not found", 404));
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});
