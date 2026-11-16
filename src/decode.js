// Text "decodes" from random grid characters into the real words.
// The element keeps its real text for screen readers via aria-label.

const WIDE = "#@%8*=+";
const NARROW = ":|/!;";

export function decode(el, { duration = 450 } = {}) {
  const text = el.textContent;
  el.setAttribute("aria-label", text);

  // One span per character, each locked to its final width so the line
  // does not jump around while the characters change.
  const words = text.split(" ");
  el.textContent = "";
  const spans = [];
  words.forEach((word, i) => {
    const wordEl = document.createElement("span");
    wordEl.style.display = "inline-block";
    wordEl.style.whiteSpace = "nowrap";
    wordEl.setAttribute("aria-hidden", "true");
    for (const ch of word) {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.display = "inline-block";
      wordEl.append(s);
      spans.push({ el: s, ch, glyphs: WIDE });
    }
    el.append(wordEl);
    if (i < words.length - 1) el.append(" ");
  });
  const size = parseFloat(getComputedStyle(el).fontSize);
  for (const s of spans) {
    const width = s.el.getBoundingClientRect().width;
    s.el.style.width = `${width}px`;
    s.el.style.textAlign = "center";
    // Narrow letters get narrow stand-ins so nothing overlaps.
    if (width < size * 0.45) s.glyphs = NARROW;
  }

  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    spans.forEach((s, i) => {
      // Characters settle from left to right.
      const settled = t >= 0.35 + 0.65 * (i / spans.length);
      s.el.textContent = settled ? s.ch : s.glyphs[Math.floor(Math.random() * s.glyphs.length)];
    });
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = text; // back to plain text
    }
  }
  requestAnimationFrame(frame);
}
