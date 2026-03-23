// ── Particle Canvas ──────────────────────────────────
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLORS = ['#58cc02','#f6c90e','#ce82ff','#ff4b4b','#1cb0f6'];

class Particle {
  constructor() { this.reset(true); }
  reset(random = false) {
    this.x = Math.random() * W;
    this.y = random ? Math.random() * H : H + 10;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.5 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 400 + 200;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha * (1 - this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(loop);
}
loop();

// ── Card hover tilt ──────────────────────────────────
document.querySelectorAll('.task-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-6px) scale(1.01) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;

    // Move glow
    const glow = card.querySelector('.card-glow');
    glow.style.left = (e.clientX - r.left - 100) + 'px';
    glow.style.top  = (e.clientY - r.top  - 100) + 'px';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── XP bar confetti on load ──────────────────────────
setTimeout(() => {
  const fill = document.querySelector('.xp-fill');
  if (fill) fill.style.setProperty('--width', '100%');
}, 1000);