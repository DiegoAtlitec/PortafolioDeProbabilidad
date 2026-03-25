let datosFases = [[], [], []];
let histCharts = [null, null, null];

const CFG = [
    { id: 1, nom: 'Práctica', color: '#58cc02', hColor: 'rgba(88, 204, 2, 0.3)' },
    { id: 2, nom: 'Competitivo', color: '#f6c90e', hColor: 'rgba(246, 201, 14, 0.3)' },
    { id: 3, nom: 'Torneo', color: '#ff4b4b', hColor: 'rgba(255, 75, 75, 0.3)' }
];

const getMedia = a => a.reduce((s, x) => s + x, 0) / a.length;
const getMediana = s => s.length % 2 !== 0 ? s[Math.floor(s.length/2)] : (s[s.length/2 - 1] + s[s.length/2]) / 2;
const getCuartil = (s, k) => {
    const p = k * (s.length + 1) / 4;
    const f = Math.floor(p);
    const frac = p - f;
    if (f <= 0) return s[0];
    if (f >= s.length) return s[s.length-1];
    return s[f-1] + frac * (s[f] - s[f-1]);
};

function simular() {
    const n = parseInt(document.getElementById('inputN').value) || 25;
    const rng = [
        { min: parseInt(document.getElementById('pMin').value), max: parseInt(document.getElementById('pMax').value) },
        { min: parseInt(document.getElementById('cMin').value), max: parseInt(document.getElementById('cMax').value) },
        { min: parseInt(document.getElementById('tMin').value), max: parseInt(document.getElementById('tMax').value) }
    ];

    datosFases = rng.map(r => Array.from({length: n}, () => ({
        total: Math.floor(Math.random() * (r.max - r.min + 1)) + r.min,
        asist: Math.floor(Math.random() * 5) + 1,
        muertes: Math.floor(Math.random() * 8) + 2
    })));

    document.getElementById('tablasWrap').style.display = 'block';
    CFG.forEach(c => renderTabla(c.id, datosFases[c.id - 1]));
    actualizar();
}

function actualizar() {
    renderHistogramas();
    renderBoxplot();
    renderConclusiones();
}

function renderTabla(id, datos) {
    const tbody = document.getElementById(`tbody${id}`);
    tbody.innerHTML = '';
    datos.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>JUGADOR ${i + 1}</td>
            <td contenteditable="true" class="edit-cell" data-f="${id - 1}" data-j="${i}">${d.total}</td>
            <td>${d.asist}</td>
            <td>${d.muertes}</td>
        `;
        tr.querySelector('.edit-cell').addEventListener('input', (e) => {
            let val = parseInt(e.target.innerText) || 0;
            datosFases[e.target.dataset.f][e.target.dataset.j].total = val;
            actualizar(); // ESTO ASEGURA QUE BOXPLOT E HISTOGRAMA SE ACTUALICEN
        });
        tbody.appendChild(tr);
    });
}

function renderHistogramas() {
    const maxK = Math.max(...datosFases.flat().map(x => x.total), 15);
    CFG.forEach((c, i) => {
        const vals = datosFases[i].map(x => x.total);
        const labels = Array.from({length: maxK + 1}, (_, k) => k);
        const counts = labels.map(l => vals.filter(v => v === l).length);
        if(histCharts[i]) histCharts[i].destroy();
        histCharts[i] = new Chart(document.getElementById(`hist${c.id}`).getContext('2d'), {
            type: 'bar', 
            data: { labels, datasets: [{ data: counts, backgroundColor: c.hColor, borderColor: c.color, borderWidth: 1 }]},
            options: { plugins: { legend: false }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }}}}
        });
        document.getElementById(`inter-h${c.id}`).innerHTML = `Frecuencia máxima: ${labels[counts.indexOf(Math.max(...counts))]} kills.`;
    });
}

function renderBoxplot() {
    const canvas = document.getElementById('bpCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth, H = 320;
    canvas.width = W; canvas.height = H;
    const globalMax = Math.max(...datosFases.flat().map(x => x.total), 20);
    const sx = v => 100 + (v / globalMax) * (W - 200);

    let interpretacionBox = "";

    CFG.forEach((c, i) => {
        const d = datosFases[i].map(x => x.total).sort((a, b) => a - b);
        const q1 = getCuartil(d, 1), q2 = getMediana(d), q3 = getCuartil(d, 3), ric = q3 - q1;
        const minW = d.find(x => x >= q1 - 1.5 * ric), maxW = [...d].reverse().find(x => x <= q3 + 1.5 * ric);
        const y = 60 + i * 90;

        ctx.strokeStyle = c.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx(minW), y); ctx.lineTo(sx(maxW), y); ctx.stroke();
        ctx.fillStyle = c.hColor; ctx.fillRect(sx(q1), y-20, sx(q3)-sx(q1), 40);
        ctx.strokeRect(sx(q1), y-20, sx(q3)-sx(q1), 40);
        ctx.beginPath(); ctx.moveTo(sx(q2), y-20); ctx.lineTo(sx(q2), y+20); ctx.lineWidth=4; ctx.stroke();

        ctx.fillStyle = "white"; ctx.font = "bold 10px Space Mono"; ctx.textAlign = "center";
        ctx.fillText(`${minW}`, sx(minW), y - 30);
        ctx.fillText(`${q1.toFixed(1)}`, sx(q1), y + 35);
        ctx.fillText(`${q2.toFixed(1)}`, sx(q2), y - 30);
        ctx.fillText(`${q3.toFixed(1)}`, sx(q3), y + 35);
        ctx.fillText(`${maxW}`, sx(maxW), y - 30);

        ctx.textAlign = "right"; ctx.fillStyle = c.color; ctx.fillText(c.nom, 80, y + 5);
        interpretacionBox += `<li><strong>${c.nom}:</strong> Rango Intercuartil de ${ric.toFixed(1)}.</li>`;
    });
    document.getElementById('inter-bp').innerHTML = `<ul>${interpretacionBox}</ul>`;
}

function renderConclusiones() {
    const body = document.getElementById('concBody');
    const summaries = CFG.map((c, i) => {
        const d = datosFases[i].map(x => x.total).sort((a, b) => a - b);
        return { nom: c.nom, media: getMedia(d) };
    });
    const mejor = summaries.reduce((p, c) => (p.media > c.media) ? p : c);
    body.innerHTML = `<div class="conc-block"><h4>Análisis de Tendencia</h4><p>Promedio más alto: ${mejor.nom} (${mejor.media.toFixed(2)} kills).</p></div>`;
}

document.getElementById('btnSimular').addEventListener('click', simular);
document.querySelectorAll('.fase-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.fase-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.fase-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById(`panel-${btn.dataset.fase}`).classList.remove('hidden');
    });
});
