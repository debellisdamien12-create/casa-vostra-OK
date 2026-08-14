import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const OWNER_EMAIL = "contact@casavostra.corsica";
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

async function sendBrevoEmail(payload: NotificationPayload): Promise<boolean> {
  if (!ENV.brevoApiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not configured.");
    return false;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": ENV.brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: OWNER_EMAIL, name: SENDER_NAME },
      to: [{ email: OWNER_EMAIL, name: SENDER_NAME }],
      subject: payload.title,
      textContent: payload.content,
      tags: ["casa-vostra", "brief-site"],
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    console.warn(`[Brevo] Email rejected (${response.status}): ${responseText}`);
    return false;
  }

  console.log(`[Brevo] Email accepted for ${OWNER_EMAIL}: ${responseText}`);
  return true;
}

async function sendManusFallback(payload: NotificationPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return false;

  try {
    const response = await fetch(buildEndpointUrl(ENV.forgeApiUrl), {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        title: payload.title,
        content: `[DESTINATAIRE E-MAIL: ${OWNER_EMAIL}]\n\n${payload.content}`,
      }),
    });

    if (!response.ok) {
      console.warn(`[Notification Fallback] Manus service rejected notification (${response.status}).`);
      return false;
    }

    console.log("[Notification Fallback] Manus notification accepted.");
    return true;
  } catch (error) {
    console.warn("[Notification Fallback] Manus service unavailable:", error);
    return false;
  }
}

/**
 * Sends the owner notification through Brevo. Manus remains a visible fallback,
 * but a successful Manus notification is never reported as an e-mail delivery.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const validatedPayload = validatePayload(payload);

  try {
    if (await sendBrevoEmail(validatedPayload)) {
      return true;
    }
  } catch (error) {
    console.warn("[Brevo] Error sending transactional email:", error);
  }

  await sendManusFallback(validatedPayload);
  return false;
}
