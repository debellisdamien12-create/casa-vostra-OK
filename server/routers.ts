import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { leads } from "../drizzle/schema";

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
          contactName: z.string().optional(),
          contactPhone: z.string().min(1, "Le téléphone est obligatoire"),
          contactEmail: z.string().email("E-mail valide obligatoire"),
          selectedSlot: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Base de données indisponible");
        }

        await db.insert(leads).values({
          projectType: input.projectType,
          projectNature: input.projectNature,
          surface: input.surface || null,
          budget: input.budget || null,
          supplyScope: input.supplyScope || null,
          timeline: input.timeline || null,
          location: input.location || null,
          details: input.details || null,
          mediaSummary: input.mediaSummary || null,
          contactName: input.contactName || null,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          selectedSlot: input.selectedSlot || null,
          status: "new",
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
