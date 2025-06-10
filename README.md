# ts-webhook-relay

A lightweight TypeScript/Node.js service that receives webhooks, normalizes payloads, and forwards them to multiple downstream APIs through a plugin architecture.

## Architecture

```
                         ┌──────────────┐
  POST /webhook ──────►  │   Express    │
                         │   Server     │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  Normalizer  │  ← raw JSON → WebhookPayload
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │    Router    │  ← loads plugins from config
                         └──┬───┬───┬──┘
                            │   │   │
                   ┌────────┘   │   └────────┐
                   ▼            ▼            ▼
              ┌────────┐  ┌────────┐  ┌────────┐
              │ Slack  │  │ Email  │  │ Logger │
              │ Plugin │  │ Plugin │  │ Plugin │
              └────────┘  └────────┘  └────────┘
```

Each plugin implements a common interface: `validate → transform → send`. Failed deliveries are retried and then moved to an in-memory dead letter queue.

## Tech Stack

- TypeScript, Node.js, Express
- Jest for testing
- Docker for containerization

## Quick Start

```bash
npm install
npm run dev
```

Or with Docker:

```bash
docker-compose up --build
```

## Usage

```bash
# Send a webhook
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"source": "github", "event": "push", "data": {"ref": "main"}}'

# Health check
curl http://localhost:3000/health

# View failed deliveries
curl http://localhost:3000/dead-letter
```

## Plugin Interface

Every plugin implements:

```typescript
interface Plugin {
  name: string;
  validate(payload: WebhookPayload): boolean;
  transform(payload: WebhookPayload): unknown;
  send(transformed: unknown): Promise<PluginResult>;
}
```

To add a new plugin: create a class implementing `Plugin`, then register it in `src/router.ts`.

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `ENABLED_PLUGINS` | `slack,email,logger` | Comma-separated plugin list |
| `SLACK_WEBHOOK_URL` | mock URL | Slack incoming webhook URL |
| `EMAIL_API_URL` | `http://localhost:3001/send` | Email API endpoint |
| `RETRY_ATTEMPTS` | `3` | Retry count before dead-lettering |
| `LOG_FILE` | `webhook.log` | File path for logger plugin |

## Project Structure

```
ts-webhook-relay/
├── src/
│   ├── index.ts                 # Express server
│   ├── router.ts                # Plugin registry + routing + DLQ
│   ├── plugins/
│   │   ├── plugin.interface.ts  # Plugin contract
│   │   ├── slack.plugin.ts      # Slack webhook forwarder
│   │   ├── email.plugin.ts      # Email API forwarder
│   │   └── logger.plugin.ts     # Console/file logger
│   ├── transform/
│   │   └── payload.ts           # Payload normalization
│   └── config/
│       └── index.ts             # Typed env config
├── tests/
│   ├── router.test.ts
│   ├── plugins/
│   │   └── slack.plugin.test.ts
│   └── transform/
│       └── payload.test.ts
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
├── jest.config.ts
└── package.json
```

## Running Tests

```bash
npm test
```
