import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const PORT = Number(process.env.PORT || 3000);
const DATAJUD_URL = process.env.DATAJUD_URL || "https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search";
const API_KEY = process.env.DATAJUD_API_KEY;
const publicDir = join(process.cwd(), "public");

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

function normalizeProcessNumber(value = "") {
  return String(value).replace(/\D/g, "");
}

async function queryDataJud(numeroProcesso) {
  if (!API_KEY) throw new Error("Defina DATAJUD_API_KEY antes de iniciar a aplicação.");
  const response = await fetch(DATAJUD_URL, {
    method: "POST",
    headers: { Authorization: `APIKey ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ size: 10, query: { match: { numeroProcesso } } })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`DataJud respondeu HTTP ${response.status}`);
  return payload;
}

function summarizeHit(hit) {
  const p = hit?._source ?? {};
  const movimentos = [...(p.movimentos ?? [])].sort((a, b) => new Date(b.dataHora ?? 0) - new Date(a.dataHora ?? 0));
  return { numeroProcesso: p.numeroProcesso, tribunal: p.tribunal, grau: p.grau, dataAjuizamento: p.dataAjuizamento, ultimaAtualizacao: p.dataHoraUltimaAtualizacao, classe: p.classe, orgaoJulgador: p.orgaoJulgador, movimentos };
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/processo") {
    const numero = normalizeProcessNumber(url.searchParams.get("numero"));
    if (numero.length !== 20) return json(res, 400, { error: "Número inválido" });
    try {
      const raw = await queryDataJud(numero);
      const hits = raw?.hits?.hits ?? [];
      return json(res, 200, { query: numero, processos: hits.map(summarizeHit), raw });
    } catch (error) {
      return json(res, 502, { error: error.message });
    }
  }
  if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { ok: true, endpoint: DATAJUD_URL });
  return false;
}

const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(req, res, url);
    if (handled !== false) return;
    return json(res, 404, { error: "Rota não encontrada" });
  }
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  if (requested.includes("..")) { res.writeHead(400); return res.end("Bad request"); }
  try {
    const file = await readFile(join(publicDir, requested));
    res.writeHead(200, { "content-type": mime[extname(requested)] || "application/octet-stream" });
    res.end(file);
  } catch { res.writeHead(404); res.end("Not found"); }
});
server.listen(PORT, () => console.log(`DataJud Teste: http://localhost:${PORT}`));
