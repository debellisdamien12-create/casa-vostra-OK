import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

// `contact@` est l’adresse publique de Casa Vostra et un alias Microsoft 365.
// Les brief doivent être routés directement vers la boîte principale, afin de
// ne pas dépendre du traitement d’un message envoyé de l’alias vers lui-même.
export const OWNER_EMAIL = "gestion@casavostra.corsica";
export const SENDER_EMAIL = "contact@casavostra.corsica";
const SENDER_NAME = "Casa Vostra";
const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

async function sendBrevoEmail(
  toEmail: string,
  toName: string,
  title: string,
  content: string,
  attachments?: Array<{ name: string; content: string }>
): Promise<boolean> {
  if (!ENV.brevoApiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not configured.");
    return false;
  }

  const payload: Record<string, unknown> = {
    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email: toEmail, name: toName || "Client Casa Vostra" }],
    subject: title,
    textContent: content,
    tags: ["casa-vostra", "transactional"],
  };

  if (attachments && attachments.length > 0) {
    payload.attachment = attachments.map(att => ({
      name: att.name,
      content: att.content, // base64 string without data prefix
    }));
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": ENV.brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    console.warn(`[Brevo] Email to ${toEmail} rejected (${response.status}): ${responseText}`);
    return false;
  }

  console.log(`[Brevo] Email successfully sent to ${toEmail}: ${responseText}`);
  return true;
}

export async function notifyOwner(
  payload: NotificationPayload,
  attachments?: Array<{ name: string; content: string }>
): Promise<boolean> {
  const validatedPayload = validatePayload(payload);
  try {
    return await sendBrevoEmail(OWNER_EMAIL, SENDER_NAME, validatedPayload.title, validatedPayload.content, attachments);
  } catch (error) {
    console.warn("[Brevo] Error sending owner email:", error);
    return false;
  }
}

export async function notifyClient(
  clientEmail: string,
  clientName: string,
  payload: NotificationPayload,
  attachments?: Array<{ name: string; content: string }>
): Promise<boolean> {
  const validatedPayload = validatePayload(payload);
  try {
    return await sendBrevoEmail(clientEmail, clientName, validatedPayload.title, validatedPayload.content, attachments);
  } catch (error) {
    console.warn("[Brevo] Error sending client email:", error);
    return false;
  }
}
