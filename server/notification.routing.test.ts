import { describe, expect, it } from "vitest";
import { OWNER_EMAIL, SENDER_EMAIL } from "./_core/notification";

describe("routage des e-mails Casa Vostra", () => {
  it("envoie les briefs vers la boîte Microsoft 365 principale et conserve contact comme expéditeur public", () => {
    expect(OWNER_EMAIL).toBe("gestion@casavostra.corsica");
    expect(SENDER_EMAIL).toBe("contact@casavostra.corsica");
    expect(OWNER_EMAIL).not.toBe(SENDER_EMAIL);
  });
});
