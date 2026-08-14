import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  storagePut: vi.fn(),
}));

vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("leads.submit success flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.storagePut.mockResolvedValue({
      key: "leads/plan_abc123.pdf",
      url: "/manus-storage/leads/plan_abc123.pdf",
    });
            const values = vi.fn().mockResolvedValue([{ insertId: 42 }]);
        mocks.getDb.mockResolvedValue({
          insert: vi.fn().mockReturnValue({ values }),
        });

  });

  it("stores a valid lead, uploads its media, and returns a lead id", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.leads.submit({
      projectType: "Pose de Carrelage & Faïence",
      projectNature: "Rénovation",
      surface: "45",
      budget: "5 000 € à 15 000 €",
      supplyScope: "Fourniture par le client",
      timeline: "Dans le mois",
      location: "Lecci",
      details: "Pose grand format",
      mediaSummary: "plan.pdf",
      media: [{
        name: "plan.pdf",
        type: "application/pdf",
        size: 128,
        data: "data:application/pdf;base64,cGxhbg==",
      }],
      contactName: "Client Test",
      contactPhone: "06 12 34 56 78",
      contactEmail: "client@example.com",
      selectedSlot: "Demain à 09h00 (Téléphone / Visio)",
    });

    expect(result).toMatchObject({ success: true, leadId: 42 });
    expect(mocks.storagePut).toHaveBeenCalledOnce();
    expect(mocks.storagePut.mock.calls[0]?.[2]).toBe("application/pdf");
    expect(mocks.getDb).toHaveBeenCalledOnce();
  });
});
