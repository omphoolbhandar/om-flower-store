/* ============================================================
   Om Flower Store — Animated petal/flower canvas background
   Lightweight decorative layer behind all storefront pages.
   Respects prefers-reduced-motion (skips animation entirely).
   ============================================================ */

(function () {
  const canvas = document.getElementById('petals');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(232,196,216,', 'rgba(196,92,138,', 'rgba(245,237,214,'];
  const FLOWER_EMOJIS = ['🌸', '🌺', '🌹', '🌼', '💐', '🌷'];

  // Fewer particles on small screens / inner pages so it stays decorative,
  // not distracting while shopping or filling a form.
  const density = canvas.dataset.density || 'normal';
  const counts = density === 'light' ? { petals: 25, flowers: 16 } : { petals: 50, flowers: 38 };

  function Petal() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * H;
    this.r = 3 + Math.random() * 5;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = 0.4 + Math.random() * 0.6;
    this.rot = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.025;
    this.alpha = 0.12 + Math.random() * 0.3;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  Petal.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.r, this.r * 1.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color + '1)';
    ctx.fill();
    ctx.restore();
  };
  Petal.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotV;
    if (this.y > H + 20) { this.x = Math.random() * W; this.y = -20; }
  };

  function Flower() {
    this.emoji = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * H;
    this.size = 13 + Math.random() * 16;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = 0.3 + Math.random() * 0.5;
    this.rot = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.018;
    this.alpha = 0.15 + Math.random() * 0.3;
  }
  Flower.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.alpha;
    ctx.font = this.size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  };
  Flower.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotV;
    if (this.y > H + 30) { this.x = Math.random() * W; this.y = -30; }
  };

  for (let i = 0; i < counts.petals; i++) particles.push(new Petal());
  for (let i = 0; i < counts.flowers; i++) particles.push(new Flower());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();
