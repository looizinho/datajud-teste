const form = document.querySelector('#form');
const input = document.querySelector('#numero');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const rawBox = document.querySelector('#rawBox');
const raw = document.querySelector('#raw');

const esc = (s) => String(s ?? '—').replace(
  /[&<>"']/g,
  (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[c],
);

const date = (s) => s
  ? new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(s))
  : '—';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Consultando DataJud…';
  result.innerHTML = '';
  rawBox.hidden = true;

  try {
    const r = await fetch(`/api/processo?numero=${encodeURIComponent(input.value)}`);
    const data = await r.json();

    raw.textContent = JSON.stringify(data, null, 2);
    rawBox.hidden = false;

    if (!r.ok) {
      throw new Error(data.error || `HTTP ${r.status}`);
    }

    if (!data.processos.length) {
      status.textContent = 'Nenhum processo encontrado.';
      return;
    }

    status.textContent = `${data.processos.length} registro(s) encontrado(s).`;
    result.innerHTML = data.processos.map((p) => `
      <article class="card">
        <div class="meta">
          <div>
            <span class="label">Processo</span>
            <span class="value">${esc(p.numeroProcesso)}</span>
          </div>
          <div>
            <span class="label">Tribunal / Grau</span>
            <span class="value">${esc(p.tribunal)} • ${esc(p.grau)}</span>
          </div>
          <div>
            <span class="label">Classe</span>
            <span class="value">${esc(p.classe?.nome)}</span>
          </div>
          <div>
            <span class="label">Órgão julgador</span>
            <span class="value">${esc(p.orgaoJulgador?.nome)}</span>
          </div>
          <div>
            <span class="label">Atualização</span>
            <span class="value">${date(p.ultimaAtualizacao)}</span>
          </div>
        </div>
      </article>
      <article class="card">
        <h2>Movimentações (${p.movimentos.length})</h2>
        ${p.movimentos.map((m) => `
          <div class="move">
            <div class="date">
              ${date(m.dataHora)} • código ${esc(m.codigo)}
            </div>
            <strong>${esc(m.nome)}</strong>
          </div>
        `).join('') || '<p>Nenhuma movimentação retornada.</p>'}
      </article>
    `).join('');
  } catch (err) {
    status.textContent = `Erro: ${err.message}`;
  }
});

form.requestSubmit();
