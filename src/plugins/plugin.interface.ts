export interface WebhookPayload {
  id: string;
  source: string;
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface PluginResult {
  plugin: string;
  success: boolean;
  error?: string;
}

export interface Plugin {
  name: string;
  validate(payload: WebhookPayload): boolean;
  transform(payload: WebhookPayload): unknown;
  send(transformed: unknown): Promise<PluginResult>;
}
