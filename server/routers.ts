import { COOKIE_NAME } from "@shared/const";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { leads } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner, notifyClient } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { createHmac, timingSafeEqual } from "node:crypto";

const mediaInput = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(120),
  size: z.number().int().nonnegative().max(10 * 1024 * 1024),
  data: z.string().max(14_000_000),
});

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 160) || "piece-jointe";
}

type ValidationTokenPayload = {
  email: string;
  name: string;
  projectType: string;
  projectNature: string;
  exp: number;
};

const VALIDATION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function validationSigningKey() {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error("Clé de signature indisponible");
  return key;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createValidationToken(payload: Omit<ValidationTokenPayload, "exp">) {
  const tokenPayload: ValidationTokenPayload = {
    ...payload,
    exp: Date.now() + VALIDATION_TOKEN_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = createHmac("sha256", validationSigningKey()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyValidationToken(token: string): ValidationTokenPayload {
  const [encodedPayload, receivedSignature] = token.split(".");
  if (!encodedPayload || !receivedSignature) throw new Error("Lien de validation invalide");

  const expectedSignature = createHmac("sha256", validationSigningKey()).update(encodedPayload).digest("base64url");
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw new Error("Lien de validation invalide");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as ValidationTokenPayload;
  if (!payload.email || !payload.projectType || !Number.isFinite(payload.exp) || Date.now() > payload.exp) {
    throw new Error("Lien de validation expiré");
  }
  return payload;
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
        let newLeadId = Math.floor(Math.random() * 900000) + 100000;
        const uploadedMedia: Array<{ name: string; type: string; size: number; key: string; url: string }> = [];

        try {
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
        } catch (storageErr) {
          console.warn("[Storage] Warning during file upload, proceeding anyway:", storageErr);
        }

        let aiSummary = `Projet de ${input.projectType.toLowerCase()} (${input.projectNature.toLowerCase()})${input.surface ? ` d'environ ${input.surface}` : ""}${input.location ? ` à ${input.location}` : ""}. Interventions prévues selon calendrier ${input.timeline ? input.timeline.toLowerCase() : "souhaité"}.`;
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

        try {
          const db = await getDb();
          if (db) {
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
            if (result[0]?.insertId) {
              newLeadId = Number(result[0].insertId);
            }
          }
        } catch (dbErr) {
          console.error("[Database] Failed to insert lead, proceeding with notification:", dbErr);
        }

        try {
          const appUrl = "https://casavostra.corsica";
          const validationToken = createValidationToken({
            email: input.contactEmail,
            name: input.contactName || "Client Casa Vostra",
            projectType: input.projectType,
            projectNature: input.projectNature,
          });
          const validationUrl = `${appUrl}/?validationToken=${encodeURIComponent(validationToken)}`;
          const attachedFiles = input.media ?? [];
          const mediaText = attachedFiles.length > 0
            ? attachedFiles.map(file => `- ${safeFileName(file.name)} (${(file.size / 1024 / 1024).toFixed(1)} Mo) : joint à cet e-mail`).join("\n")
            : "Aucune pièce jointe";

          const brevoAttachments = (input.media ?? []).map(file => {
            const pureBase64 = file.data.includes(",") ? file.data.slice(file.data.indexOf(",") + 1) : file.data;
            return {
              name: safeFileName(file.name),
              content: pureBase64,
            };
          });

          const notificationPayload = {
            title: `[Casa Vostra] Nouveau brief #${newLeadId} - ${input.contactName || input.contactEmail}`,
            content: `DESTINATAIRE: contact@casavostra.corsica\nUn nouveau brief client a été soumis sur le site !\n\nSynthèse IA :\n${aiSummary}\n\nClient : ${input.contactName || "Anonyme"}\nTél : ${input.contactPhone}\nE-mail : ${input.contactEmail}\nType : ${input.projectType} (${input.projectNature})\nSurface : ${input.surface || "N/C"} m²\nBudget : ${input.budget || "N/C"}\nFourniture : ${input.supplyScope || "N/C"}\nLocalisation : ${input.location || "N/C"}\nDélai : ${input.timeline || "N/C"}\n\nDétails :\n${input.details || "Aucun détail"}\n\nPièces jointes (${brevoAttachments.length}) :\n${mediaText}\n\n---------------------------------------------\nVALIDER LA DEMANDE ET DONNER ACCÈS AUX CRÉneaux OUTLOOK :\n${validationUrl}\n---------------------------------------------`
          };
          console.log(`[LeadSubmission] Dispatching owner notification for lead #${newLeadId} to contact@casavostra.corsica with ${brevoAttachments.length} attachments`);
          await notifyOwner(notificationPayload, brevoAttachments);
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
      .input(z.object({ validationToken: z.string().min(20).max(2048) }))
      .mutation(async ({ input }) => {
        const lead = verifyValidationToken(input.validationToken);
        const outlookBookingUrl = "https://outlook.office.com/bookwithme/user/04c7a9fd021d40db8160275606058dab@casavostra.corsica/meetingtype/A0XVrKrIGkC8uiftM5IXDQ2?bookingcode=fede475a-d342-4441-b3f0-b44bd1d1bf8e&anonymous&ismsaljsauthenabled&ep=mlink";

        const clientSent = await notifyClient(
          lead.email,
          lead.name,
          {
            title: `[Casa Vostra] Votre projet a été validé — Choisissez votre créneau de rendez-vous`,
            content: `Bonjour ${lead.name},\n\nExcellente nouvelle ! Votre projet de ${lead.projectType} (${lead.projectNature}) a été examiné et validé par l'équipe Casa Vostra SARL.\n\nVous pouvez désormais choisir votre créneau de rendez-vous en un clic dans notre agenda Outlook :\n${outlookBookingUrl}\n\nÀ très bientôt,\nCasa Vostra SARL — BTP, Carrelage & Faïence haut de gamme\nhttps://casavostra.corsica`,
          }
        );

        if (!clientSent) {
          throw new Error("L’e-mail client n’a pas pu être envoyé. Vérifiez BREVO_API_KEY dans Render.");
        }

        await notifyOwner({
          title: `[Casa Vostra] Brief validé — accès Outlook envoyé à ${lead.email}`,
          content: `Vous avez validé le brief de ${lead.name} (${lead.email}).\n\nLe client a reçu l’accès direct au planning Outlook pour son projet : ${lead.projectType} (${lead.projectNature}).`,
        });

        return { success: true, clientEmail: lead.email };
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
