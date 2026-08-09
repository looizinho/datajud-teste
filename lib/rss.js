const MAX_FEED_ITEMS = 50;

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toUTCString() : date.toUTCString();
}

function movementDescription(movement) {
  return [
    movement.nome,
    movement.codigo == null ? null : `Código: ${movement.codigo}`,
    movement.complemento,
    movement.tipo,
    movement.orgaoJulgador?.nome
  ]
    .filter(Boolean)
    .join(" — ");
}

function movementGuid(numeroProcesso, movement) {
  return `${numeroProcesso}-${movement.codigo ?? "sem-codigo"}-${movement.dataHora ?? "sem-data"}`;
}

export function createProcessFeed(processo, feedUrl) {
  const numeroProcesso = processo.numeroProcesso || "Processo não identificado";
  const movimentos = [...(processo.movimentos ?? [])]
    .sort((a, b) => new Date(b.dataHora ?? 0) - new Date(a.dataHora ?? 0))
    .slice(0, MAX_FEED_ITEMS);
  const latestDate = movimentos[0]?.dataHora || processo.ultimaAtualizacao;
  const title = `Processo ${numeroProcesso}`;
  const description = [
    processo.tribunal,
    processo.grau,
    processo.classe?.nome,
    processo.orgaoJulgador?.nome
  ]
    .filter(Boolean)
    .join(" — ");

  const items = movimentos
    .map((movement) => {
      const date = movement.dataHora;
      return [
        "    <item>",
        `      <title>${escapeXml(movement.nome || "Movimentação")}</title>`,
        `      <description>${escapeXml(movementDescription(movement))}</description>`,
        `      <pubDate>${escapeXml(toRfc822(date))}</pubDate>`,
        `      <guid isPermaLink="false">${escapeXml(movementGuid(numeroProcesso, movement))}</guid>`,
        "    </item>"
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(feedUrl)}</link>`,
    `    <description>${escapeXml(description || `Movimentações do ${title}`)}</description>`,
    `    <pubDate>${escapeXml(toRfc822(latestDate))}</pubDate>`,
    `    <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />`,
    items,
    "  </channel>",
    "</rss>"
  ].filter(Boolean).join("\n");
}

export { MAX_FEED_ITEMS };
