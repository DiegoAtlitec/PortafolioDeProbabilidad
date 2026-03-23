// app1.js — Tarea 1: Flor de Calabaza
// Simulador de producción floral + estadísticas + histogramas + boxplot

/* ══════════════════════════════════════════════
   CONFIGURACIÓN DE FASES
   ══════════════════════════════════════════════ */
const FASES = [
  {
    id: 1,
    nombre: 'Fase 1 — Inicio de floración',
    dias: '1–7',
    minFlores: 4, maxFlores: 8,
    minFem: 0.05, maxFem: 0.15,
    color: '#58cc02',
    histColor: 'rgba(88,204,2,0.55)',
    histBorder: '#58cc02',
  },
  {
    id: 2,
    nombre: 'Fase 2 — Transición reproductiva',
    dias: '8–14',
    minFlores: 6, maxFlores: 10,
    minFem: 0.15, maxFem: 0.30,
    color: '#f6c90e',
    histColor: 'rgba(246,201,14,0.55)',
    histBorder: '#f6c90e',
  },
  {
    id: 3,
    nombre: 'Fase 3 — Consolidación reproductiva',
    dias: '15–21',
    minFlores: 8, maxFlores: 12,
    minFem: 0.30, maxFem: 0.45,
    color: '#ff9f43',
    histColor: 'rgba(255,159,67,0.55)',
    histBorder: '#ff9f43',
  },
];

const N_PLANTAS = 20;

/* ══════════════════════════════════════════════
   ESTADO
   ══════════════════════════════════════════════ */
let datosFases = [[], [], []]; // datos por fase
let histCharts = [null, null, null];
let bpChart = null;

/* ══════════════════════════════════════════════
   UTILIDADES ESTADÍSTICAS
   ══════════════════════════════════════════════ */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function media(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function mediana(sorted) {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function moda(arr) {
  const freq = {};
  arr.forEach(v => (freq[v] = (freq[v] || 0) + 1));
  const maxF = Math.max(...Object.values(freq));
  if (maxF === 1) return 'No hay';
  return Object.keys(freq)
    .filter(k => freq[k] === maxF)
    .map(Number)
    .join(', ');
}

// Cuartil por interpolación lineal (método estándar)
function cuartil(sorted, k) {
  const n = sorted.length;
  const pos = k * (n + 1) / 4;
  const fl = Math.floor(pos);
  const frac = pos - fl;
  if (fl <= 0) return sorted[0];
  if (fl >= n) return sorted[n - 1];
  return sorted[fl - 1] + frac * (sorted[fl] - sorted[fl - 1]);
}

function varianza(arr) {
  const m = media(arr);
  return arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
}

function desviacion(arr) {
  return Math.sqrt(varianza(arr));
}

/* ══════════════════════════════════════════════
   GENERACIÓN DE DATOS
   ══════════════════════════════════════════════ */
function simularFase(cfg) {
  return Array.from({ length: N_PLANTAS }, (_, i) => {
    const total = randInt(cfg.minFlores, cfg.maxFlores);
    const pctFem = randFloat(cfg.minFem, cfg.maxFem);
    const fem = Math.round(total * pctFem);
    const masc = total - fem;
    return { planta: i + 1, total, fem, masc, pctFem: (fem / total * 100).toFixed(1) };
  });
}

/* ══════════════════════════════════════════════
   RENDER TABLA
   ══════════════════════════════════════════════ */
function renderTabla(faseIdx, datos) {
  const tbody = document.getElementById(`tbody${faseIdx}`);
  tbody.innerHTML = '';
  datos.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${d.planta}</td>
      <td style="font-weight:800;color:#fff">${d.total}</td>
      <td style="color:#ff9f43">${d.fem}</td>
      <td style="color:#58cc02">${d.masc}</td>
      <td style="color:rgba(255,255,255,.55)">${d.pctFem}%</td>`;
    tbody.appendChild(tr);
  });

  const totales = datos.map(d => d.total).sort((a, b) => a - b);
  document.getElementById(`sorted${faseIdx}`).textContent = totales.join(', ');

  const cfg = FASES[faseIdx - 1];
  document.getElementById(`pstat${faseIdx}`).textContent =
    `Media total: ${media(datos.map(d => d.total)).toFixed(2)} flores/planta`;
}

/* ══════════════════════════════════════════════
   ESTADÍSTICAS
   ══════════════════════════════════════════════ */
function renderStats() {
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = '';

  FASES.forEach((cfg, fi) => {
    const datos = datosFases[fi].map(d => d.total).sort((a, b) => a - b);
    const n = datos.length;
    const m = media(datos);
    const med = mediana(datos);
    const mod = moda(datos.map(d => d));
    const Q1 = cuartil(datos, 1);
    const Q2 = cuartil(datos, 2);
    const Q3 = cuartil(datos, 3);
    const ric = Q3 - Q1;
    const limInf = Q1 - 1.5 * ric;
    const limSup = Q3 + 1.5 * ric;
    const sigma = desviacion(datos);
    const atipicos = datos.filter(v => v < limInf || v > limSup);

    const rows = [
      { n: 'n (plantas)', f: '—', v: n },
      { n: 'Media (x̄)', f: 'Σxᵢ / n', v: m.toFixed(3) },
      { n: 'Mediana', f: 'pos (n+1)/2', v: med },
      { n: 'Moda', f: 'máx frecuencia', v: mod },
      { n: 'Q₁ (25%)', f: '1·(n+1)/4', v: Q1.toFixed(3) },
      { n: 'Q₂ (50%)', f: '2·(n+1)/4', v: Q2.toFixed(3) },
      { n: 'Q₃ (75%)', f: '3·(n+1)/4', v: Q3.toFixed(3) },
      { n: 'RIC', f: 'Q₃ − Q₁', v: ric.toFixed(3) },
      { n: 'L. Inferior', f: 'Q₁ − 1.5·RIC', v: limInf.toFixed(3) },
      { n: 'L. Superior', f: 'Q₃ + 1.5·RIC', v: limSup.toFixed(3) },
      { n: 'Desv. Estándar', f: '√(Σ(xᵢ−x̄)²/n)', v: sigma.toFixed(3) },
      { n: 'Valores atípicos', f: 'v < LI ó v > LS', v: atipicos.length === 0 ? '✓ Ninguno' : atipicos.join(', ') },
    ];

    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.setProperty('--pc', cfg.color);
    card.innerHTML = `
      <div class="stat-card-title">${cfg.nombre}</div>
      ${rows.map(r => `
        <div class="stat-row">
          <div>
            <div class="stat-name">${r.n}</div>
            <div class="stat-formula">${r.f}</div>
          </div>
          <div class="stat-val">${r.v}</div>
        </div>`).join('')}
    `;
    grid.appendChild(card);
  });

  document.getElementById('secStats').style.display = '';
}

/* ══════════════════════════════════════════════
   HISTOGRAMAS
   ══════════════════════════════════════════════ */
function buildHistograma(canvasId, datos, cfg) {
  // Rango general: 4–12 flores → intervalos de 1
  const labels = [];
  const freqs = [];
  for (let v = 4; v <= 12; v++) {
    labels.push(`${v}`);
    freqs.push(datos.filter(d => d === v).length);
  }

  const chartInst = histCharts[cfg.id - 1];
  if (chartInst) chartInst.destroy();

  const ctx = document.getElementById(canvasId).getContext('2d');
  histCharts[cfg.id - 1] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Plantas',
        data: freqs,
        backgroundColor: cfg.histColor,
        borderColor: cfg.histBorder,
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e2028',
          borderColor: cfg.histBorder,
          borderWidth: 1,
          titleColor: cfg.color,
          bodyColor: 'rgba(255,255,255,.7)',
          callbacks: {
            title: items => `${items[0].label} flores`,
            label: item => ` ${item.raw} planta${item.raw !== 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Flores totales', color: 'rgba(255,255,255,.35)', font: { family: 'Nunito', weight: '700', size: 11 } },
          ticks: { color: 'rgba(255,255,255,.4)', font: { family: 'Space Mono', size: 10 } },
          grid: { color: 'rgba(255,255,255,.04)' },
        },
        y: {
          title: { display: true, text: 'Frecuencia', color: 'rgba(255,255,255,.35)', font: { family: 'Nunito', weight: '700', size: 11 } },
          ticks: { color: 'rgba(255,255,255,.4)', stepSize: 1, font: { family: 'Space Mono', size: 10 } },
          grid: { color: 'rgba(255,255,255,.05)' },
          beginAtZero: true,
        },
      },
    },
  });
}

function renderHistogramas() {
  FASES.forEach((cfg, fi) => {
    const datos = datosFases[fi].map(d => d.total);
    buildHistograma(`hist${cfg.id}`, datos, cfg);
  });
  document.getElementById('secHist').style.display = '';
}

/* ══════════════════════════════════════════════
   BOXPLOT (Canvas manual — 3 fases juntas)
   ══════════════════════════════════════════════ */
function renderBoxplot() {
  // 1. Mostrar la sección PRIMERO para que el DOM calcule el ancho real
  document.getElementById('secBoxplot').style.display = '';

  const canvas = document.getElementById('bpCanvas');
  const ctx = canvas.getContext('2d');

  // 2. Ahora sí, clientWidth tendrá el valor correcto (ej. 800px)
  const W = canvas.parentElement.clientWidth - 24;
  const H = 340;
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  // Calcular estadísticos
  const statsArr = FASES.map((cfg, fi) => {
    const datos = datosFases[fi].map(d => d.total).sort((a, b) => a - b);
    const Q1 = cuartil(datos, 1);
    const Q2 = cuartil(datos, 2);
    const Q3 = cuartil(datos, 3);
    const ric = Q3 - Q1;
    const limInf = Q1 - 1.5 * ric;
    const limSup = Q3 + 1.5 * ric;
    const whiskerMin = datos.find(v => v >= limInf) ?? datos[0];
    const whiskerMax = [...datos].reverse().find(v => v <= limSup) ?? datos[datos.length - 1];
    const outliers = datos.filter(v => v < limInf || v > limSup);
    return { Q1, Q2, Q3, ric, limInf, limSup, whiskerMin, whiskerMax, outliers, cfg };
  });

  // Escala global 0–14
  const PAD_LEFT = 48;
  const PAD_RIGHT = 24;
  const PAD_TOP = 32;
  const PAD_BOT = 44;
  const globalMin = 0;
  const globalMax = 14;
  const plotW = W - PAD_LEFT - PAD_RIGHT;

  function sx(v) {
    return PAD_LEFT + ((v - globalMin) / (globalMax - globalMin)) * plotW;
  }

  // Eje X
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD_LEFT, H - PAD_BOT);
  ctx.lineTo(W - PAD_RIGHT, H - PAD_BOT);
  ctx.stroke();

  for (let i = 0; i <= 14; i++) {
    const x = sx(i);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.beginPath(); ctx.moveTo(x, PAD_TOP); ctx.lineTo(x, H - PAD_BOT); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(i, x, H - PAD_BOT + 14);
  }

  // Etiqueta eje X
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total de flores por planta', W / 2, H - 6);

  // Dibujar cada fase
  const nFases = 3;
  const rowH = (H - PAD_TOP - PAD_BOT) / nFases;
  const boxH = rowH * 0.42;

  statsArr.forEach((s, i) => {
    const midY = PAD_TOP + rowH * i + rowH / 2;
    const color = s.cfg.color;

    // Fondo etiqueta fase
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    ctx.beginPath();
    ctx.roundRect(2, midY - rowH * 0.46, PAD_LEFT - 4, rowH * 0.92, 6);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 9px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`F${i + 1}`, (PAD_LEFT) / 2, midY + 4);

    // Línea whiskers
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(sx(s.whiskerMin), midY);
    ctx.lineTo(sx(s.whiskerMax), midY);
    ctx.stroke();

    // Tapas bigotes
    [s.whiskerMin, s.whiskerMax].forEach(v => {
      ctx.beginPath();
      ctx.moveTo(sx(v), midY - boxH * 0.3);
      ctx.lineTo(sx(v), midY + boxH * 0.3);
      ctx.stroke();
    });

    // Caja IQR
    ctx.fillStyle = color + '1a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    const bx = sx(s.Q1);
    const bw = sx(s.Q3) - sx(s.Q1);
    ctx.beginPath();
    ctx.roundRect(bx, midY - boxH / 2, bw, boxH, 5);
    ctx.fill();
    ctx.stroke();

    // Mediana
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(sx(s.Q2), midY - boxH / 2);
    ctx.lineTo(sx(s.Q2), midY + boxH / 2);
    ctx.stroke();

    // Outliers
    s.outliers.forEach(v => {
      ctx.fillStyle = '#ff4b4b';
      ctx.beginPath();
      ctx.arc(sx(v), midY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Etiquetas numéricas clave
    const labels = [
      { v: s.whiskerMin, t: s.whiskerMin },
      { v: s.Q1, t: s.Q1.toFixed(1) },
      { v: s.Q2, t: `Med\n${s.Q2.toFixed(1)}` },
      { v: s.Q3, t: s.Q3.toFixed(1) },
      { v: s.whiskerMax, t: s.whiskerMax },
    ];
    labels.forEach(({ v, t }) => {
      const lines = t.toString().split('\n');
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.font = '9px Space Mono, monospace';
      ctx.textAlign = 'center';
      if (lines.length > 1) {
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fillText(lines[0], sx(v), midY - boxH / 2 - 14);
        ctx.fillStyle = color;
        ctx.font = 'bold 9px Space Mono, monospace';
        ctx.fillText(lines[1], sx(v), midY - boxH / 2 - 4);
      } else {
        ctx.fillText(t, sx(v), midY - boxH / 2 - 6);
      }
    });
  });

  // ── Leyenda numérica debajo ──
  const legend = document.getElementById('bpLegend');
  legend.innerHTML = '';
  statsArr.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'bp-leg-card';
    card.style.setProperty('--pc', s.cfg.color);
    card.innerHTML = `
      <div class="bp-leg-title">${s.cfg.nombre}</div>
      ${[
        ['Mínimo (bigote)', s.whiskerMin],
        ['Q₁ (25%)', s.Q1.toFixed(3)],
        ['Mediana Q₂', s.Q2.toFixed(3)],
        ['Q₃ (75%)', s.Q3.toFixed(3)],
        ['Máximo (bigote)', s.whiskerMax],
        ['RIC', s.ric.toFixed(3)],
        ['L. Inferior', s.limInf.toFixed(3)],
        ['L. Superior', s.limSup.toFixed(3)],
        ['Atípicos', s.outliers.length === 0 ? '✓ Ninguno' : s.outliers.join(', ')],
      ].map(([k, v]) => `
        <div class="bp-leg-row">
          <span class="bp-leg-k">${k}</span>
          <span class="bp-leg-v">${v}</span>
        </div>`).join('')}
    `;
    legend.appendChild(card);
  });

  document.getElementById('secBoxplot').style.display = '';
}

/* ══════════════════════════════════════════════
   CONCLUSIONES
   ══════════════════════════════════════════════ */
function renderConclusiones() {
  const body = document.getElementById('concBody');

  const summaries = FASES.map((cfg, fi) => {
    const datos = datosFases[fi].map(d => d.total).sort((a, b) => a - b);
    const Q1 = cuartil(datos, 1);
    const Q3 = cuartil(datos, 3);
    const ric = Q3 - Q1;
    const limInf = Q1 - 1.5 * ric;
    const limSup = Q3 + 1.5 * ric;
    const atipicos = datos.filter(v => v < limInf || v > limSup);
    const m = media(datos);
    const s = desviacion(datos);
    return { cfg, m, s, ric, atipicos };
  });

  const concs = summaries.map(({ cfg, m, s, ric, atipicos }) => `
    <div class="conc-card" style="--pc:${cfg.color}">
      <div class="conc-title">${cfg.nombre}</div>
      <div class="conc-text">
        Media de <strong style="color:${cfg.color}">${m.toFixed(2)}</strong> flores/planta,
        desviación estándar de <strong style="color:${cfg.color}">${s.toFixed(2)}</strong>.
        RIC = ${ric.toFixed(2)}.
        ${atipicos.length === 0
          ? '<span class="no-atip">✓ Sin valores atípicos.</span>'
          : `<span class="si-atip">⚠ Atípicos: ${atipicos.join(', ')}</span>`}
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="conc-grid">${concs}</div>
    <p class="conc-footer">
      📈 <strong>Tendencia observada:</strong> La producción total de flores por planta aumenta conforme el cultivo avanza de la Fase 1 (inicio, flores predominantemente masculinas) 
      a la Fase 3 (consolidación reproductiva, mayor proporción de flores femeninas). 
      La dispersión también tiende a incrementarse, lo que coincide con la variabilidad biológica mayor descrita para la etapa de consolidación reproductiva. 
      Las herramientas estadísticas — histograma y diagrama de caja y bigotes — permiten visualizar estas tendencias de forma clara y cuantitativa.
    </p>
  `;

  document.getElementById('secConc').style.display = '';
}

/* ══════════════════════════════════════════════
   TABS INTERACTIVOS
   ══════════════════════════════════════════════ */
document.querySelectorAll('.fase-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fase-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const fase = btn.dataset.fase;
    document.querySelectorAll('.fase-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`panel-${fase}`).classList.remove('hidden');
  });
});

/* ══════════════════════════════════════════════
   BOTÓN SIMULAR
   ══════════════════════════════════════════════ */
document.getElementById('btnSimular').addEventListener('click', () => {
  // Generar datos
  datosFases = FASES.map(cfg => simularFase(cfg));

  // Total general
  const total = datosFases.flat().reduce((s, d) => s + d.total, 0);

  // Chips
  document.getElementById('chipTotal').textContent = `${total} flores totales`;
  document.getElementById('simChips').style.display = 'flex';
  document.getElementById('tablasWrap').style.display = '';

  // Render tablas
  FASES.forEach((cfg, fi) => renderTabla(cfg.id, datosFases[fi]));

  // Activar tab 1
  document.querySelectorAll('.fase-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.fase-panel').forEach((p, i) => p.classList.toggle('hidden', i !== 0));

  // Estadísticas
  renderStats();

  // Histogramas
  renderHistogramas();

  // Boxplot (con delay para que el DOM esté pintado)
  setTimeout(() => {
    renderBoxplot();
    renderConclusiones();
  }, 80);
});