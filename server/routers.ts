import { COOKIE_NAME } from "@shared/const";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { leads } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

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

        // Generate AI summary or deterministic fallback first
        let aiSummary = "";
        try {
          const prompt = `Résume en 2 phrases courtes et professionnelles le projet de carrelage/faïence/chape pour l'artisan Casa Vostra :
- Type : ${input.projectType} (${input.projectNature})
- Surface : ${input.surface || "Non précisée"}
- Budget : ${input.budget || "Non précisé"}
- Fourniture : ${input.supplyScope || "Non précisée"}
- Localisation : ${input.location || "Non précisée"}
- Délai : ${input.timeline || "Non précisé"}
- Précisions : ${input.details || "Aucune"}
Sois direct, factuel et chaleureux.`;

          const llmRes = await invokeLLM({
            messages: [{ role: "user", content: prompt }],
            maxTokens: 180,
          });
          const choiceContent = llmRes.choices?.[0]?.message?.content;
          if (typeof choiceContent === "string" && choiceContent.trim().length > 0) {
            aiSummary = choiceContent.trim();
          }
        } catch (err) {
          console.warn("[AISummary] LLM invocation failed, using fallback:", err);
        }

        if (!aiSummary) {
          aiSummary = `Projet de ${input.projectType.toLowerCase()} (${input.projectNature.toLowerCase()})${input.surface ? ` d'environ ${input.surface}` : ""}${input.location ? ` à ${input.location}` : ""}. Interventions prévues selon calendrier ${input.timeline ? input.timeline.toLowerCase() : "souhaité"}.`;
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
          aiSummary,
          status: input.selectedSlot ? "rdv_requested" : "new",
        });

        const newLeadId = Number(result[0]?.insertId ?? 0);

        // Send owner notification email with direct validation link
        try {
          const appUrl = process.env.VITE_APP_URL || "https://3000-ifkg0zn3lyy3r3otfm1ko-870840ed.us4.manus.computer";
          const validationUrl = `${appUrl}/?validateLead=${newLeadId}`;
          const mediaText = uploadedMedia.length > 0 ? uploadedMedia.map(m => `- ${m.name} (${(m.size/1024/1024).toFixed(1)}Mo): ${m.url}`).join("\n") : "Aucune pièce jointe";

          const notificationPayload = {
            title: `[Casa Vostra] Nouveau brief #${newLeadId} - ${input.contactName || input.contactEmail}`,
            content: `DESTINATAIRE: contact@casavostra.corsica\nUn nouveau brief client a été soumis sur le site !\n\nSynthèse IA :\n${aiSummary}\n\nClient : ${input.contactName || "Anonyme"}\nTél : ${input.contactPhone}\nE-mail : ${input.contactEmail}\nType : ${input.projectType} (${input.projectNature})\nSurface : ${input.surface || "N/C"} m²\nBudget : ${input.budget || "N/C"}\nFourniture : ${input.supplyScope || "N/C"}\nLocalisation : ${input.location || "N/C"}\nDélai : ${input.timeline || "N/C"}\n\nDétails :\n${input.details || "Aucun détail"}\n\nPièces jointes :\n${mediaText}\n\n---------------------------------------------\nVALIDER LA DEMANDE ET DONNER ACCÈS AUX CRÉneaux OUTLOOK :\n${validationUrl}\n---------------------------------------------`
          };
          console.log(`[LeadSubmission] Dispatching owner notification for lead #${newLeadId} to contact@casavostra.corsica`);
          await notifyOwner(notificationPayload);
        } catch (err) {
          console.error("[OwnerNotification] Failed to send email:", err);
        }

        return { success: true, leadId: newLeadId, aiSummary, media: uploadedMedia };
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

    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const allLeads = await db.select().from(leads).orderBy(leads.createdAt);
      return allLeads.reverse();
    }),

    validateLead: publicProcedure
      .input(z.object({ leadId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Base de données indisponible");
        await db.update(leads)
          .set({ status: "validated" })
          .where(eq(leads.id, input.leadId));
        return { success: true };
      }),

    getStatus: publicProcedure
      .input(z.object({ leadId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { status: "new" };
        const found = await db.select().from(leads).where(eq(leads.id, input.leadId)).limit(1);
        if (found.length === 0) return { status: "new" };
        return { status: found[0]?.status || "new", selectedSlot: found[0]?.selectedSlot, aiSummary: found[0]?.aiSummary };
      }),
  }),
});

export type AppRouter = typeof appRouter;
