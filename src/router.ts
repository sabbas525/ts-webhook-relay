import { Plugin, WebhookPayload, PluginResult } from "./plugins/plugin.interface";
import { SlackPlugin } from "./plugins/slack.plugin";
import { EmailPlugin } from "./plugins/email.plugin";
import { LoggerPlugin } from "./plugins/logger.plugin";
import { AppConfig } from "./config";

export interface DeadLetterEntry {
  payload: WebhookPayload;
  plugin: string;
  error: string;
  timestamp: string;
}

const pluginConstructors: Record<string, () => Plugin> = {
  slack: () => new SlackPlugin(),
  email: () => new EmailPlugin(),
  logger: () => new LoggerPlugin(),
};

export class Router {
  private plugins: Plugin[] = [];
  private deadLetterQueue: DeadLetterEntry[] = [];
  private retryAttempts: number;

  constructor(config: AppConfig) {
    this.retryAttempts = config.retryAttempts;
    for (const name of config.enabledPlugins) {
      const ctor = pluginConstructors[name.trim()];
      if (ctor) this.plugins.push(ctor());
    }
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }

  getDeadLetterQueue(): DeadLetterEntry[] {
    return this.deadLetterQueue;
  }

  async route(payload: WebhookPayload): Promise<PluginResult[]> {
    const results: PluginResult[] = [];

    for (const plugin of this.plugins) {
      if (!plugin.validate(payload)) {
        results.push({ plugin: plugin.name, success: false, error: "validation failed" });
        continue;
      }

      const transformed = plugin.transform(payload);
      let result: PluginResult | null = null;

      for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
        result = await plugin.send(transformed);
        if (result.success) break;
      }

      if (result && !result.success) {
        this.deadLetterQueue.push({
          payload,
          plugin: plugin.name,
          error: result.error || "unknown",
          timestamp: new Date().toISOString(),
        });
      }

      if (result) results.push(result);
    }

    return results;
  }
}
