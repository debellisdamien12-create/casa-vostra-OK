import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const baseLead = {
  projectType: "Pose de Carrelage & Faïence",
  projectNature: "Rénovation",
  contactPhone: "06 12 34 56 78",
  contactEmail: "client@example.com",
};

describe("leads.submit validation", () => {
  it("rejects an invalid e-mail before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.leads.submit({
        ...baseLead,
        contactEmail: "client@",
      })
    ).rejects.toThrow("E-mail valide obligatoire");
  });

  it("rejects an invalid French phone number before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.leads.submit({
        ...baseLead,
        contactPhone: "12345",
      })
    ).rejects.toThrow("Numéro de téléphone français invalide");
  });
});
