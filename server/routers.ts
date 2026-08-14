import { COOKIE_NAME } from "@shared/const";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { leads } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const mediaInput = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(120),
  size: z.number().int().nonnegative().max(10 * 1024 * 1024),
  data: z.string().max(14_000_000),
});

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 160) || "piece-jointe";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  leads: router({
    submit: publicProcedure
      .input(
        z.object({
          projectType: z.string(),
          projectNature: z.string(),
          surface: z.string().optional(),
          budget: z.string().optional(),
          supplyScope: z.string().optional(),
          timeline: z.string().optional(),
          location: z.string().optional(),
          details: z.string().optional(),
          mediaSummary: z.string().optional(),
          media: z.array(mediaInput).max(6).superRefine((files, ctx) => {
            const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
            if (totalBytes > 35 * 1024 * 1024) {
              ctx.addIssue({ code: "custom", message: "Les pièces jointes dépassent 35 Mo au total" });
            }
          }).optional(),
          contactName: z.string().optional(),
          contactPhone: z.string().regex(/^(?:(?:\+|00)33|0)[1-9](?:[\s.-]?\d{2}){4}$/, "Numéro de téléphone français invalide"),
          contactEmail: z.string().email("E-mail valide obligatoire"),
          selectedSlot: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Base de données indisponible");
        }

        const uploadedMedia: Array<{ name: string; type: string; size: number; key: string; url: string }> = [];
        for (const file of input.media ?? []) {
          const payload = file.data.includes(",") ? file.data.slice(file.data.indexOf(",") + 1) : file.data;
          const buffer = Buffer.from(payload, "base64");
          const stored = await storagePut(`leads/${Date.now()}-${safeFileName(file.name)}`, buffer, file.type || "application/octet-stream");
          uploadedMedia.push({
            name: file.name,
            type: file.type,
            size: file.size,
            key: stored.key,
            url: stored.url,
          });
        }

        const result = await db.insert(leads).values({
          projectType: input.projectType,
          projectNature: input.projectNature,
          surface: input.surface || null,
          budget: input.budget || null,
          supplyScope: input.supplyScope || null,
          timeline: input.timeline || null,
          location: input.location || null,
          details: input.details || null,
          mediaSummary: JSON.stringify(uploadedMedia),
          contactName: input.contactName || null,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          selectedSlot: input.selectedSlot || null,
          status: input.selectedSlot ? "rdv_requested" : "new",
        });

        return { success: true, leadId: Number(result[0]?.insertId ?? 0), media: uploadedMedia };
      }),

    assignSlot: publicProcedure
      .input(z.object({
        leadId: z.number().int().positive(),
        selectedSlot: z.string().min(1).max(128),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Base de données indisponible");
        }
        await db.update(leads)
          .set({ selectedSlot: input.selectedSlot, status: "rdv_requested" })
          .where(eq(leads.id, input.leadId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
