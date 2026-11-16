// Generated placeholder covers: a field of character cells in the project's
// colours. They stand in until a real image is set in projects.js.

const GLYPHS = "#@%8*=+:";

function hash(a, b, c) {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

const PATTERNS = {
  rings: (x, y, w, h) => Math.sin(Math.hypot(x - w * 0.62, y - h * 0.45) * 0.42),
  waves: (x, y) => Math.sin(y * 0.42 + Math.sin(x * 0.21) * 2.4),
  bands: (x, y) => Math.sin((x + y * 1.4) * 0.3) + Math.sin(x * 0.09) * 0.4,
  drift: (x, y) => Math.sin(x * 0.19 + y * 0.07) + Math.sin(y * 0.23 - x * 0.05) * 0.9 - 0.2,
};

export function drawCover(canvas, cover, { width = 1200, height = 900, seed = 1, cell = 20 } = {}) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const pattern = PATTERNS[cover.pattern] || PATTERNS.rings;

  ctx.fillStyle = cover.ground;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `500 ${Math.round(cell * 0.8)}px "Geist Mono Variable", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = pattern(x, y, cols, rows);
      if (v < -0.15) continue;
      const h = hash(x, y, seed);
      const px = x * cell;
      const py = y * cell;
      if (v > 0.2) {
        ctx.fillStyle = v > 0.6 ? cover.hi : cover.lo;
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        ctx.fillStyle = v > 0.6 ? cover.ground : cover.ink;
      } else {
        ctx.fillStyle = cover.lo;
      }
      ctx.fillText(GLYPHS[h % GLYPHS.length], px + cell / 2, py + cell / 2 + 1);
    }
  }
}
