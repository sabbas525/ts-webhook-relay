import { normalizePayload } from "../../src/transform/payload";

describe("normalizePayload", () => {
  it("maps standard fields", () => {
    const result = normalizePayload({
      id: "abc",
      source: "github",
      event: "push",
      timestamp: "2025-01-01T00:00:00Z",
      data: { ref: "main" },
    });
    expect(result.id).toBe("abc");
    expect(result.source).toBe("github");
    expect(result.event).toBe("push");
    expect(result.data).toEqual({ ref: "main" });
  });

  it("falls back to alternate field names", () => {
    const result = normalizePayload({ origin: "jira", type: "ticket.created" });
    expect(result.source).toBe("jira");
    expect(result.event).toBe("ticket.created");
    expect(result.id).toBeDefined();
  });

  it("handles empty payload", () => {
    const result = normalizePayload({});
    expect(result.source).toBe("unknown");
    expect(result.event).toBe("unknown");
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });
});
