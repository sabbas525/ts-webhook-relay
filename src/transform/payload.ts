import { WebhookPayload } from "../plugins/plugin.interface";
import { randomUUID } from "crypto";

// Normalizes raw incoming JSON into a standard WebhookPayload
export function normalizePayload(raw: Record<string, unknown>): WebhookPayload {
  return {
    id: (raw.id as string) || randomUUID(),
    source: (raw.source as string) || (raw.origin as string) || "unknown",
    event: (raw.event as string) || (raw.type as string) || (raw.action as string) || "unknown",
    timestamp: (raw.timestamp as string) || new Date().toISOString(),
    data: (raw.data as Record<string, unknown>) || raw,
  };
}
