import { describe, expect, it } from "vitest";

describe("Brevo API configuration", () => {
  it("accepts the configured API key", async () => {
    const apiKey = process.env.BREVO_API_KEY;
    expect(apiKey, "BREVO_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        accept: "application/json",
        "api-key": apiKey as string,
      },
    });

    const body = await response.text();
    expect(response.ok, body).toBe(true);
    const account = JSON.parse(body) as { email?: string; companyName?: string };
    expect(account).toBeDefined();
  }, 15_000);
});

export {};
