import { Plugin, WebhookPayload, PluginResult } from "./plugin.interface";
import { appendFileSync } from "fs";
import { loadConfig } from "../config";

export class LoggerPlugin implements Plugin {
  name = "logger";
  private logFile: string;

  constructor(logFile?: string) {
    this.logFile = logFile || loadConfig().logFile;
  }

  validate(): boolean {
    return true;
  }

  transform(payload: WebhookPayload): string {
    return `[${payload.timestamp}] ${payload.source}/${payload.event}: ${JSON.stringify(payload.data)}\n`;
  }

  async send(transformed: unknown): Promise<PluginResult> {
    try {
      const line = transformed as string;
      appendFileSync(this.logFile, line);
      console.log(line.trim());
      return { plugin: this.name, success: true };
    } catch (err) {
      return { plugin: this.name, success: false, error: (err as Error).message };
    }
  }
}
