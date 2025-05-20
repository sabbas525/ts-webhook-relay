import { Plugin, WebhookPayload, PluginResult } from "./plugin.interface";
import { loadConfig } from "../config";

export class EmailPlugin implements Plugin {
  name = "email";
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || loadConfig().emailApiUrl;
  }

  validate(payload: WebhookPayload): boolean {
    return !!payload.event;
  }

  transform(payload: WebhookPayload): Record<string, unknown> {
    return {
      subject: `Webhook: ${payload.event} from ${payload.source}`,
      body: JSON.stringify(payload.data, null, 2),
      timestamp: payload.timestamp,
    };
  }

  async send(transformed: unknown): Promise<PluginResult> {
    try {
      const res = await fetch(this.apiUrl, {
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
