document.addEventListener('DOMContentLoaded', () => {
  // ── UTILIDADES MATEMÁTICAS ──
  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    return f;
  }
  function combinatoria(n, k) {
    if (k < 0 || k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
  }

  // ── ALMACÉN DE GRÁFICAS ──
  const charts = { binom: null, nbinom: null, geom: null, poisson: null, exp: null };

  // ── CONFIGURACIÓN COMÚN CHART.JS ──
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400, easing: 'easeOutQuart' },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: {family: 'Space Mono'} } },
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: {family: 'Space Mono'} } }
    }
  };

  function updateChart(id, type, labels, data, color) {
    const ctx = document.getElementById(`chart-${id}`).getContext('2d');
    if (charts[id]) charts[id].destroy();

    const isLine = type === 'line';
    charts[id] = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: isLine ? `${color}33` : color,
          borderColor: color,
          borderWidth: isLine ? 3 : 2,
          borderRadius: isLine ? 0 : 4,
          fill: isLine,
          tension: 0.4,
          pointBackgroundColor: '#fff',
          pointRadius: isLine ? 0 : 3
        }]
      },
      options: chartOptions
    });
  }

  // ── FUNCIONES DE DIBUJO POR DISTRIBUCIÓN ──

  function drawBinomial() {
    const n = parseInt(document.getElementById('binom-n').value);
    const p = parseFloat(document.getElementById('binom-p').value);
    document.getElementById('val-binom-n').textContent = n;
    document.getElementById('val-binom-p').textContent = p.toFixed(2);

    let labels = [], data = [];
    for (let k = 0; k <= n; k++) {
      labels.push(k);
      let px = combinatoria(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      data.push(px);
    }
    updateChart('binom', 'bar', labels, data, '#1cb0f6');
  }

  function drawNegBinomial() {
    const r = parseInt(document.getElementById('nbinom-r').value);
    const p = parseFloat(document.getElementById('nbinom-p').value);
    document.getElementById('val-nbinom-r').textContent = r;
    document.getElementById('val-nbinom-p').textContent = p.toFixed(2);

    let labels = [], data = [];
    // Calculamos hasta un k razonable para visualizar (ej. hasta que la prob decaiga)
    const maxK = r + Math.floor((r * (1 - p)) / p) + 15; 
    for (let k = r; k <= maxK; k++) {
      labels.push(k);
      let px = combinatoria(k - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, k - r);
      data.push(px);
    }
    updateChart('nbinom', 'bar', labels, data, '#ff4b4b');
  }

  function drawGeometric() {
    const p = parseFloat(document.getElementById('geom-p').value);
    document.getElementById('val-geom-p').textContent = p.toFixed(2);

    let labels = [], data = [];
    for (let k = 1; k <= 20; k++) {
      labels.push(k);
      let px = Math.pow(1 - p, k - 1) * p;
      data.push(px);
    }
    updateChart('geom', 'bar', labels, data, '#58cc02');
  }

  function drawPoisson() {
    const lam = parseFloat(document.getElementById('poisson-lam').value);
    document.getElementById('val-poisson-lam').textContent = lam;

    let labels = [], data = [];
    const maxK = Math.max(15, Math.ceil(lam * 2.5));
    for (let k = 0; k <= maxK; k++) {
      labels.push(k);
      let px = (Math.pow(lam, k) * Math.exp(-lam)) / factorial(k);
      data.push(px);
    }
    updateChart('poisson', 'bar', labels, data, '#ce82ff');
  }

  function drawExponential() {
    const lam = parseFloat(document.getElementById('exp-lam').value);
    document.getElementById('val-exp-lam').textContent = lam.toFixed(1);

    let labels = [], data = [];
    for (let x = 0; x <= 5; x += 0.2) {
      labels.push(x.toFixed(1));
      let fx = lam * Math.exp(-lam * x);
      data.push(fx);
    }
    updateChart('exp', 'line', labels, data, '#f6c90e');
  }

  // ── INICIALIZAR Y GESTIONAR TABS ──
  const drawFunctions = {
    'binom': drawBinomial, 'nbinom': drawNegBinomial, 
    'geom': drawGeometric, 'poisson': drawPoisson, 'exp': drawExponential
  };

  const tabs = document.querySelectorAll('.dist-tab');
  const panels = document.querySelectorAll('.dist-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-dist');
      document.getElementById(`panel-${targetId}`).classList.remove('hidden');
      
      // Dibujar gráfica de la pestaña activa (evita canvas con width 0)
      drawFunctions[targetId]();
    });
  });

  // ── EVENT LISTENERS PARA SLIDERS ──
  document.getElementById('binom-n').addEventListener('input', drawBinomial);
  document.getElementById('binom-p').addEventListener('input', drawBinomial);
  document.getElementById('nbinom-r').addEventListener('input', drawNegBinomial);
  document.getElementById('nbinom-p').addEventListener('input', drawNegBinomial);
  document.getElementById('geom-p').addEventListener('input', drawGeometric);
  document.getElementById('poisson-lam').addEventListener('input', drawPoisson);
  document.getElementById('exp-lam').addEventListener('input', drawExponential);

  // Inicializar la primera pestaña
  drawBinomial();
});