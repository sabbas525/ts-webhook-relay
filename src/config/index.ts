export interface AppConfig {
  port: number;
  enabledPlugins: string[];
  slackWebhookUrl: string;
  emailApiUrl: string;
  retryAttempts: number;
  logFile: string;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || "3000", 10),
    enabledPlugins: (process.env.ENABLED_PLUGINS || "slack,email,logger").split(","),
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "https://hooks.slack.com/services/mock",
    emailApiUrl: process.env.EMAIL_API_URL || "http://localhost:3001/send",
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || "3", 10),
    logFile: process.env.LOG_FILE || "webhook.log",
  };
}
