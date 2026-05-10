import { Channel } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { validate } from "../middleware/validate.js";

export const contactsRouter = Router();

contactsRouter.use(requireAuth);

// Selected fields returned to the client for every contact response
const contactSelect = {
  id: true,
  name: true,
  relationship: true,
  channel: true,
  phone: true,
  email: true,
  consentSms: true,
  consentEmail: true,
  createdAt: true,
} as const;

type ChannelValidationInput = {
  channel: Channel;
  phone?: string | undefined;
  email?: string | undefined;
  consentSms?: boolean | undefined;
  consentEmail?: boolean | undefined;
};

// Shared cross-field consent/channel validation
function validateChannelFields(data: ChannelValidationInput, ctx: z.RefinementCtx) {
  if (data.channel === Channel.SMS) {
    if (!data.phone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "phone is required for SMS channel", path: ["phone"] });
    }
    if (!data.consentSms) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "consentSms must be true for SMS channel", path: ["consentSms"] });
    }
  }
  if (data.channel === Channel.EMAIL) {
    if (!data.email) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "email is required for EMAIL channel", path: ["email"] });
    }
    if (!data.consentEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "consentEmail must be true for EMAIL channel", path: ["consentEmail"] });
    }
  }
}

const createSchema = z
  .object({
    name: z.string().min(1),
    relationship: z.string().min(1).optional(),
    channel: z.nativeEnum(Channel),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    consentSms: z.boolean().optional(),
    consentEmail: z.boolean().optional(),
  })
  .superRefine(validateChannelFields);

type CreateBody = z.infer<typeof createSchema>;

// All fields optional for PATCH-style updates, but channel constraints are
// re-enforced when channel is explicitly included in the payload.
const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    relationship: z.string().min(1).optional(),
    channel: z.nativeEnum(Channel).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    consentSms: z.boolean().optional(),
    consentEmail: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channel !== undefined) {
      validateChannelFields(
        {
          channel: data.channel,
          phone: data.phone,
          email: data.email,
          consentSms: data.consentSms,
          consentEmail: data.consentEmail,
        },
        ctx,
      );
    }
  });

type UpdateBody = z.infer<typeof updateSchema>;

const idParamsSchema = z.object({ id: z.string().min(1) });
type IdParams = z.infer<typeof idParamsSchema>;

// GET /api/contacts
contactsRouter.get("/", async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user!.id },
      select: contactSelect,
      orderBy: { createdAt: "asc" },
    });
    return res.json({ contacts });
  } catch (err) {
    return next(err);
  }
});

// POST /api/contacts
contactsRouter.post("/", validate({ body: createSchema }), async (req, res, next) => {
  try {
    const body = req.body as CreateBody;
    const contact = await prisma.contact.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        relationship: body.relationship ?? null,
        channel: body.channel,
        phone: body.phone ?? null,
        email: body.email ?? null,
        consentSms: body.consentSms ?? false,
        consentEmail: body.consentEmail ?? false,
      },
      select: contactSelect,
    });
    return res.status(201).json({ contact });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/contacts/:id
contactsRouter.put("/:id", validate({ body: updateSchema, params: idParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as IdParams;
    const body = req.body as UpdateBody;

    const existing = await prisma.contact.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return next(new AppError("Contact not found", 404));
    if (existing.userId !== req.user!.id) return next(new AppError("Forbidden", 403));

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.relationship !== undefined && { relationship: body.relationship }),
        ...(body.channel !== undefined && { channel: body.channel }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.consentSms !== undefined && { consentSms: body.consentSms }),
        ...(body.consentEmail !== undefined && { consentEmail: body.consentEmail }),
      },
      select: contactSelect,
    });
    return res.json({ contact });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/contacts/:id
contactsRouter.delete("/:id", validate({ params: idParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params as IdParams;

    const existing = await prisma.contact.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return next(new AppError("Contact not found", 404));
    if (existing.userId !== req.user!.id) return next(new AppError("Forbidden", 403));

    await prisma.contact.delete({ where: { id } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});
