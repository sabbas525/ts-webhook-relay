import { Router } from "../src/router";
import { WebhookPayload } from "../src/plugins/plugin.interface";
import { AppConfig } from "../src/config";

const testConfig: AppConfig = {
  port: 3000,
  enabledPlugins: ["logger"],
  slackWebhookUrl: "",
  emailApiUrl: "",
  retryAttempts: 1,
  logFile: "/dev/null",
};

const samplePayload: WebhookPayload = {
  id: "test-1",
  source: "unit-test",
  event: "test.run",
  timestamp: new Date().toISOString(),
  data: { foo: "bar" },
};

describe("Router", () => {
  it("loads enabled plugins", () => {
    const router = new Router(testConfig);
    expect(router.getPlugins()).toHaveLength(1);
    expect(router.getPlugins()[0].name).toBe("logger");
  });

  it("routes payload to logger plugin", async () => {
    const router = new Router(testConfig);
    const results = await router.route(samplePayload);
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
  });

  it("ignores unknown plugin names", () => {
    const router = new Router({ ...testConfig, enabledPlugins: ["nonexistent"] });
    expect(router.getPlugins()).toHaveLength(0);
  });

  it("adds to dead letter queue on failure", async () => {
    const router = new Router({ ...testConfig, enabledPlugins: ["email"] });
    const results = await router.route(samplePayload);
    expect(results[0].success).toBe(false);
    expect(router.getDeadLetterQueue().length).toBeGreaterThan(0);
  });
});
