import express from "express";
import { loadConfig } from "./config";
import { Router } from "./router";
import { normalizePayload } from "./transform/payload";

const config = loadConfig();
const router = new Router(config);

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const payload = normalizePayload(req.body);
  const results = await router.route(payload);
  res.json({ id: payload.id, results });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", plugins: router.getPlugins().map((p) => p.name) });
});

app.get("/dead-letter", (_req, res) => {
  res.json(router.getDeadLetterQueue());
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`webhook-relay listening on :${config.port}`);
    console.log(`plugins: ${router.getPlugins().map((p) => p.name).join(", ")}`);
  });
}

export { app, router };
