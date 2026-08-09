const DEFAULT_DATAJUD_URL = "https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search";

export function normalizeProcessNumber(value = "") {
  return String(value).replace(/\D/g, "");
}

export function isValidProcessNumber(value) {
  const numero = normalizeProcessNumber(value);
  if (numero.length !== 20) return false;

  const withoutCheckDigits = `${numero.slice(0, 7)}${numero.slice(9)}00`;
  const expectedCheckDigits = String(98n - (BigInt(withoutCheckDigits) % 97n)).padStart(2, "0");
  return numero.slice(7, 9) === expectedCheckDigits;
}

export function getDataJudConfig(env = process.env) {
  return {
    apiKey: env.DATAJUD_API_KEY,
    url: env.DATAJUD_URL || DEFAULT_DATAJUD_URL
  };
}

export async function queryDataJud(numeroProcesso, env = process.env) {
  const { apiKey, url } = getDataJudConfig(env);
  if (!apiKey) throw new Error("Defina DATAJUD_API_KEY antes de iniciar a aplicação.");

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `APIKey ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ size: 10, query: { match: { numeroProcesso } } })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`DataJud respondeu HTTP ${response.status}`);
  return payload;
}

export function summarizeHit(hit) {
  const processo = hit?._source ?? {};
  const movimentos = [...(processo.movimentos ?? [])].sort(
    (a, b) => new Date(b.dataHora ?? 0) - new Date(a.dataHora ?? 0)
  );
  return {
    numeroProcesso: processo.numeroProcesso,
    tribunal: processo.tribunal,
    grau: processo.grau,
    dataAjuizamento: processo.dataAjuizamento,
    ultimaAtualizacao: processo.dataHoraUltimaAtualizacao,
    classe: processo.classe,
    orgaoJulgador: processo.orgaoJulgador,
    movimentos
  };
}

export async function findProcessos(value, env = process.env) {
  const numero = normalizeProcessNumber(value);
  if (!isValidProcessNumber(numero)) return { error: "Número inválido", status: 400 };

  const raw = await queryDataJud(numero, env);
  const hits = raw?.hits?.hits ?? [];
  return { status: 200, body: { query: numero, processos: hits.map(summarizeHit), raw } };
}
