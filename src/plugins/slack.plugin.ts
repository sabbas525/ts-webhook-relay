import { Plugin, WebhookPayload, PluginResult } from "./plugin.interface";
import { loadConfig } from "../config";

export class SlackPlugin implements Plugin {
  name = "slack";
  private webhookUrl: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || loadConfig().slackWebhookUrl;
  }

  validate(payload: WebhookPayload): boolean {
    return !!payload.event && !!payload.source;
  }

  transform(payload: WebhookPayload): Record<string, unknown> {
    return {
      text: `*[${payload.source}]* \`${payload.event}\`\n${JSON.stringify(payload.data, null, 2)}`,
      username: "webhook-relay",
    };
  }

  async send(transformed: unknown): Promise<PluginResult> {
    try {
      const res = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformed),
      });
      return { plugin: this.name, success: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
    } catch (err) {
      return { plugin: this.name, success: false, error: (err as Error).message };
    }
  }
}
