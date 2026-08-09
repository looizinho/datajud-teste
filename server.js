import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { findProcessos, getDataJudConfig } from "./lib/datajud.js";

const PORT = Number(process.env.PORT || 3000);
const publicDir = join(process.cwd(), "public");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body, null, 2));
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/processo") {
    try {
      const result = await findProcessos(url.searchParams.get("numero"));
      if (result.error) return json(response, result.status, { error: result.error });
      return json(response, result.status, result.body);
    } catch (error) {
      return json(response, 502, { error: error.message });
    }
  }
  if (request.method === "GET" && url.pathname === "/api/health") {
    return json(response, 200, { ok: true, endpoint: getDataJudConfig().url });
  }
  return false;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(request, response, url);
    if (handled !== false) return;
    return json(response, 404, { error: "Rota não encontrada" });
  }

  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  if (requested.includes("..")) {
    response.writeHead(400);
    return response.end("Bad request");
  }
  try {
    const file = await readFile(join(publicDir, requested));
    response.writeHead(200, { "content-type": mime[extname(requested)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(PORT, () => console.log(`DataJud Teste: http://localhost:${PORT}`));
