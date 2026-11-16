// ASCII butterflies drawn on a character grid.
// Each butterfly is a set of grid cells: a body column, two wings that
// narrow and widen as it flaps, and antennae. Positions snap to the grid,
// which gives the stepped, typed look.

const GLYPHS = "#@%8*=+:";

// One wing, as [first, last] filled column per row (rows run top to bottom).
const WING = [
  [2, 4],
  [1, 6],
  [0, 7],
  [0, 7],
  [0, 5],
  [0, 2],
  [0, 4],
  [0, 5],
  [1, 3],
];
const HALF = (WING.length - 1) / 2;

// Depth layers: [size, opacity, speed]. Smaller ones read as further away.
const DEPTHS = [
  [1, 1, 1],
  [1, 1, 1],
  [0.7, 0.72, 0.8],
  [0.45, 0.45, 0.6],
];

export const DARK_PALETTE = {
  fillHi: "#3f7bff",
  fillLo: "#1c3a8a",
  flash: "#e6eeff",
  charHi: "#dce8ff",
  charLo: "#8fb1ff",
  charEdge: "#5b78c8",
  charFlash: "#0b1640",
  body: "#c9d8ff",
  glow: "63, 123, 255",
};

export const LIGHT_PALETTE = {
  fillHi: "#2450d6",
  fillLo: "#7f9bea",
  flash: "#0f1630",
  charHi: "#eef2ff",
  charLo: "#f2f4f8",
  charEdge: "#2450d6",
  charFlash: "#f2f4f8",
  body: "#0f1630",
  glow: null,
};

function hash(a, b, c) {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

export class Flock {
  constructor(canvas, { count = 12, cell = 12, palette = DARK_PALETTE, avoid = null, still = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.count = count;
    this.cell = cell;
    this.palette = palette;
    this.avoid = avoid; // function returning rectangles the flock steers around
    this.still = still; // reduced motion: draw one frame, never animate
    this.items = [];
    this.pointer = null;
    this.running = false;
    this.time = 0;
    this.last = 0;
    this.rects = [];
    this.frame = this.frame.bind(this);
    this.resize();
    this.seed();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.still || !this.running) this.draw();
  }

  seed() {
    this.items = [];
    this.rects = this.avoid ? this.avoid() : [];
    for (let i = 0; i < this.count; i++) {
      let x, y, tries = 0;
      do {
        x = Math.random() * this.w;
        y = Math.random() * this.h;
        tries++;
      } while (tries < 20 && this.rects.some((r) => x > r.left - 40 && x < r.right + 40 && y > r.top - 40 && y < r.bottom + 40));
      this.items.push(this.make(i, x, y));
    }
    this.draw();
  }

  make(id, x, y, angle = Math.random() * Math.PI * 2) {
    const [size, alpha, pace] = DEPTHS[id % DEPTHS.length];
    return {
      id,
      x,
      y,
      angle,
      size,
      alpha,
      speed: (34 + Math.random() * 26) * pace,
      boost: 0,
      phase: Math.random() * Math.PI * 2,
      flap: 5 + Math.random() * 3,
      turn: Math.random() * 100,
      life: Infinity,
      age: 0,
    };
  }

  // A short-lived group that flies outward from a point, then fades.
  burst(x, y, n = 5) {
    for (let i = 0; i < n; i++) {
      const b = this.make(i * 4, x, y, (i / n) * Math.PI * 2 + Math.random() * 0.6);
      b.size = i % 2 ? 0.7 : 1;
      b.alpha = 1;
      b.speed = 520 + Math.random() * 220;
      b.life = 0.9;
      this.items.push(b);
    }
    this.start();
  }

  scatter(x, y, radius = 240) {
    for (const b of this.items) {
      const dx = b.x - x;
      const dy = b.y - y;
      if (dx * dx + dy * dy < radius * radius) {
        b.angle = Math.atan2(dy, dx);
        b.boost = 3.2;
      }
    }
  }

  start() {
    if (this.running || this.still) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
  }

  frame(now) {
    if (!this.running) return;
    const elapsed = now - this.last;
    // About 30 frames a second is plenty for stepped, grid-snapped motion.
    if (elapsed >= 32) {
      const dt = Math.min(elapsed / 1000, 0.05);
      this.last = now;
      this.time += dt;
      this.step(dt);
      this.draw();
    }
    requestAnimationFrame(this.frame);
  }

  step(dt) {
    this.tick = (this.tick || 0) + 1;
    if (this.avoid && this.tick % 12 === 1) this.rects = this.avoid();
    const margin = this.cell * 9;

    for (const b of this.items) {
      b.age += dt;
      b.phase += b.flap * dt * (1 + b.boost * 0.4);
      // Wander: a slow, smooth change of heading.
      b.turn += dt;
      let steer = Math.sin(b.turn * 0.9 + b.id) * 0.7 + Math.sin(b.turn * 0.37 + b.id * 2.1) * 0.5;

      if (b.life === Infinity) {
        // Keep a little distance from the others so they do not pile up.
        for (const o of this.items) {
          if (o === b) continue;
          const dx = b.x - o.x;
          const dy = b.y - o.y;
          const near = this.cell * 13;
          if (dx * dx + dy * dy < near * near) steer += angleDelta(b.angle, Math.atan2(dy, dx)) * 1.5;
        }
        // Flee from the pointer.
        if (this.pointer) {
          const dx = b.x - this.pointer.x;
          const dy = b.y - this.pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) {
            steer += angleDelta(b.angle, Math.atan2(dy, dx)) * 6;
            b.boost = Math.max(b.boost, 1.6);
          }
        }
        // Steer around text blocks.
        for (const r of this.rects) {
          const pad = this.cell * 8;
          if (b.x > r.left - pad && b.x < r.right + pad && b.y > r.top - pad && b.y < r.bottom + pad) {
            // Turn away, and drift out through the nearest edge.
            const gaps = [b.x - (r.left - pad), r.right + pad - b.x, b.y - (r.top - pad), r.bottom + pad - b.y];
            const nearest = gaps.indexOf(Math.min(...gaps));
            const out = [Math.PI, 0, -Math.PI / 2, Math.PI / 2][nearest];
            steer += angleDelta(b.angle, out) * 5;
            b.x += Math.cos(out) * 70 * dt;
            b.y += Math.sin(out) * 70 * dt;
          }
        }
      } else {
        b.life -= dt;
        b.speed *= 1 - 1.6 * dt;
      }

      b.angle += steer * dt;
      b.boost = Math.max(0, b.boost - dt * 2.2);
      const v = b.speed * (1 + b.boost);
      b.vx = Math.cos(b.angle) * v;
      b.x += b.vx * dt;
      b.y += Math.sin(b.angle) * v * dt + Math.sin(b.phase * 0.5) * 6 * dt;

      if (b.life === Infinity) {
        if (b.x < -margin) b.x = this.w + margin;
        if (b.x > this.w + margin) b.x = -margin;
        if (b.y < -margin) b.y = this.h + margin;
        if (b.y > this.h + margin) b.y = -margin;
      }
    }

    const before = this.items.length;
    this.items = this.items.filter((b) => b.life > 0);
    if (before && !this.items.length) {
      this.stop();
      this.ctx.clearRect(0, 0, this.w, this.h);
    }
  }

  draw() {
    const { ctx, cell, palette } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.font = `500 ${Math.round(cell * 0.82)}px "Geist Mono Variable", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const shimmer = Math.floor(this.time * 4);

    // Far ones first so near ones overlap them.
    const sorted = [...this.items].sort((a, b) => a.size - b.size);
    for (const b of sorted) {
      const gx = Math.round(b.x / cell);
      const gy = Math.round(b.y / cell);
      const fade = b.life === Infinity ? 1 : Math.min(1, b.life / 0.35);
      const alpha = b.alpha * fade;
      const open = 0.22 + 0.78 * Math.abs(Math.cos(b.phase));
      const tilt = Math.max(-0.35, Math.min(0.35, (b.vx || 0) / 160));
      const rows = Math.round(HALF * b.size);

      if (palette.glow && b.size === 1) {
        const r = cell * 7;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0, `rgba(${palette.glow}, ${0.16 * alpha})`);
        g.addColorStop(1, `rgba(${palette.glow}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
      }

      for (let r = -rows; r <= rows; r++) {
        const src = WING[Math.max(0, Math.min(WING.length - 1, Math.round(r / b.size + HALF)))];
        const first = Math.round(src[0] * b.size);
        const last = Math.round(src[1] * b.size * open);
        const shift = Math.round(r * tilt);
        for (let c = first; c <= last; c++) {
          const depth = last - c;
          for (const side of [-1, 1]) {
            const cx = gx + side * (c + 1) + shift;
            const cy = gy + r;
            const h = hash(cx, cy, b.id + shimmer * (1 + ((c + r) & 1)));
            const ch = GLYPHS[h % GLYPHS.length];
            const px = cx * cell;
            const py = cy * cell;
            let ink;
            if (depth === 0 && last > 0) {
              ctx.globalAlpha = alpha * 0.6;
              ink = palette.charEdge;
            } else {
              const flash = h % 17 === 0;
              ctx.globalAlpha = alpha;
              ctx.fillStyle = flash ? palette.flash : depth === 1 ? palette.fillLo : palette.fillHi;
              ctx.fillRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
              ink = flash ? palette.charFlash : depth === 1 ? palette.charLo : palette.charHi;
            }
            ctx.fillStyle = ink;
            ctx.fillText(ch, px + cell / 2, py + cell / 2 + 0.5);
          }
        }
      }

      // Body, head and antennae.
      ctx.globalAlpha = alpha;
      ctx.fillStyle = palette.body;
      for (let r = -rows + 1; r <= rows - 1; r++) {
        ctx.fillText("|", (gx + Math.round(r * tilt)) * cell + cell / 2, (gy + r) * cell + cell / 2);
      }
      const top = gy - rows;
      const lean = Math.round(-rows * tilt);
      ctx.fillText("o", (gx + lean) * cell + cell / 2, top * cell + cell / 2);
      if (b.size > 0.5) {
        ctx.fillText("\\", (gx + lean - 1) * cell + cell / 2, (top - 1) * cell + cell / 2);
        ctx.fillText("/", (gx + lean + 1) * cell + cell / 2, (top - 1) * cell + cell / 2);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// Shortest signed turn from one heading to another.
function angleDelta(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
