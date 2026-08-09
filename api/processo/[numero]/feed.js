import { findProcessos } from "../../../../lib/datajud.js";
import { createProcessFeed } from "../../../../lib/rss.js";

function processNumberFromPath(request) {
  const url = new URL(request.url, "http://localhost");
  const match = url.pathname.match(/^\/api\/processo\/([^/]+)\/feed\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método não permitido" });
  }

  try {
    const requestedNumber = processNumberFromPath(request);
    const result = await findProcessos(requestedNumber, process.env);
    if (result.error) return response.status(result.status).json({ error: result.error });
    if (!result.body.processos.length) {
      return response.status(404).json({ error: "Processo não encontrado" });
    }

    const url = new URL(request.url, "http://localhost");
    const feedUrl = `${url.origin}/api/processo/${encodeURIComponent(result.body.query)}/feed`;
    response.setHeader("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=300");
    response.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    return response.status(200).send(createProcessFeed(result.body.processos[0], feedUrl));
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
