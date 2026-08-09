# DataJud Teste

MVP mínimo em Node.js para consultar processos do TJRJ pela API Pública do DataJud/CNJ.

## Requisitos

Node.js 22+.

## Configuração

Defina a API Key pública vigente publicada pelo CNJ:

```bash
export DATAJUD_API_KEY="sua-chave"
```

Opcionalmente, altere o endpoint com `DATAJUD_URL`.

## Rodar

```bash
npm start
```

Abra `http://localhost:3000`.

O processo de teste já vem preenchido: `0813000-58.2026.8.19.0021`.

## Próximos experimentos

1. Comparar movimentos com a Consulta Pública do PJe/TJRJ.
2. Medir a latência entre PJe e DataJud.
3. Persistir snapshots e calcular diffs.
4. Investigar acesso a documentos/PDFs separadamente.
