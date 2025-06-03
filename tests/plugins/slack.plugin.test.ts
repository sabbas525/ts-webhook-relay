import { SlackPlugin } from "../../src/plugins/slack.plugin";
import { WebhookPayload } from "../../src/plugins/plugin.interface";

const payload: WebhookPayload = {
  id: "s-1",
  source: "github",
  event: "push",
  timestamp: "2025-01-01T00:00:00Z",
  data: { ref: "main" },
};

describe("SlackPlugin", () => {
  const plugin = new SlackPlugin("https://hooks.slack.com/mock");

  it("validates payloads with source and event", () => {
    expect(plugin.validate(payload)).toBe(true);
  });

  it("rejects payloads missing source", () => {
    expect(plugin.validate({ ...payload, source: "" })).toBe(false);
  });

  it("transforms payload into slack message format", () => {
    const result = plugin.transform(payload) as Record<string, unknown>;
    expect(result).toHaveProperty("text");
    expect(result).toHaveProperty("username", "webhook-relay");
    expect((result.text as string)).toContain("github");
  });
});
