import "@fontsource-variable/host-grotesk";
import "@fontsource-variable/geist-mono";
import { animate, scroll, inView } from "motion";
import { Flock, DARK_PALETTE, LIGHT_PALETTE } from "./flock.js";
import { drawCover } from "./covers.js";
import { decode } from "./decode.js";
import { projects, disciplines } from "./projects.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_OUT = [0.16, 1, 0.3, 1];

const home = document.getElementById("home");
const caseEl = document.getElementById("case");
const hero = document.querySelector(".hero");
const foot = document.querySelector(".foot");

const ARROW_OUT = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW_BACK = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Covers ---------- */

// Returns the picture for a project: its real image if one is set in
// projects.js, otherwise a generated placeholder marked as such.
function coverNode(project, { width = 1200, height = 900, seed = 1, className = "" } = {}) {
  const wrap = document.createElement("span");
  wrap.className = `cover ${className}`.trim();
  if (project.image) {
    const img = document.createElement("img");
    img.src = project.image;
    img.alt = "";
    wrap.append(img);
  } else {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    drawCover(canvas, project.cover, { width, height, seed });
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "Placeholder";
    wrap.append(canvas, chip);
  }
  return wrap;
}

/* ---------- Home: disciplines and project cards ---------- */

function renderHome() {
  const list = document.getElementById("disciplines");
  for (const name of disciplines) {
    const li = document.createElement("li");
    li.textContent = name;
    list.append(li);
  }

  const cards = document.getElementById("cards");
  projects.forEach((project, i) => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = `#/work/${project.slug}`;
    a.dataset.slug = project.slug;
    a.innerHTML = `
      <div class="card-head"><h3></h3><p></p></div>
      <div class="card-meta"><span></span><span class="card-view">View ${ARROW_OUT}</span></div>`;
    a.querySelector("h3").textContent = project.title;
    a.querySelector(".card-head p").textContent = project.summary;
    a.querySelector(".card-meta span").textContent = project.category;
    a.querySelector(".card-head").after(coverNode(project, { seed: i + 1 }));
    cards.append(a);
  });
}

/* ---------- Case study ---------- */

function renderCase(project) {
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  caseEl.innerHTML = `
    <div class="case-inner">
      <a class="back" href="#work">${ARROW_BACK} All work</a>
      <h1 class="case-title" tabindex="-1"></h1>
      <p class="case-summary"></p>
      <dl class="facts"></dl>
      <div class="case-sections"></div>
      <a class="next" href="#/work/${next.slug}" data-slug="${next.slug}">
        <span><span class="next-label">Next project</span><span class="next-title"><span></span>${ARROW_OUT}</span></span>
      </a>
    </div>`;

  caseEl.querySelector(".back").after(coverNode(project, { width: 1600, height: 800, seed: index + 1, className: "case-cover" }));
  caseEl.querySelector(".case-title").textContent = project.title;
  caseEl.querySelector(".case-summary").textContent = project.summary;

  const facts = caseEl.querySelector(".facts");
  for (const [label, value] of [...project.facts, ["Category", project.category]]) {
    const row = document.createElement("div");
    row.innerHTML = "<dt></dt><dd></dd>";
    row.querySelector("dt").textContent = label;
    row.querySelector("dd").textContent = value;
    facts.append(row);
  }

  const sections = caseEl.querySelector(".case-sections");
  project.sections.forEach((section, i) => {
    const el = document.createElement("section");
    el.className = "case-section";
    el.innerHTML = "<h2></h2><p></p>";
    el.querySelector("h2").textContent = section.heading;
    el.querySelector("p").textContent = section.body;
    if (section.figure) {
      const figure = document.createElement("figure");
      figure.className = "case-figure";
      const caption = document.createElement("figcaption");
      caption.textContent = section.figure;
      figure.append(coverNode(project, { width: 1600, height: 900, seed: (index + 1) * 10 + i }), caption);
      el.append(figure);
    }
    sections.append(el);
  });

  caseEl.querySelector(".next-title span").textContent = next.title;
  caseEl.querySelector(".next").append(coverNode(next, { width: 800, height: 600, seed: projects.indexOf(next) + 1 }));
}

/* ---------- Butterflies ---------- */

const small = window.innerWidth < 600;
const cell = small ? 9 : 12;
document.querySelector(".field").style.setProperty("--cell", `${cell}px`);

let flock;
let burst;
let heroVisible = true;
let footVisible = false;

function avoidRects() {
  const rects = [];
  for (const el of home.querySelectorAll("[data-avoid]")) {
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) rects.push(r);
  }
  return rects;
}

function updateFlock() {
  if (!flock) return;
  const active = !home.hidden && !document.hidden && (heroVisible || footVisible);
  if (active) flock.start();
  else flock.stop();
}

function setupFlock() {
  flock = new Flock(document.getElementById("field"), {
    count: small ? 8 : 14,
    cell,
    palette: DARK_PALETTE,
    avoid: avoidRects,
    still: reduced,
  });
  burst = new Flock(document.getElementById("burst"), { count: 0, cell: 10, palette: LIGHT_PALETTE, still: reduced });

  const watch = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
      if (entry.target === foot) footVisible = entry.isIntersecting;
    }
    updateFlock();
  });
  watch.observe(hero);
  watch.observe(foot);
  document.addEventListener("visibilitychange", updateFlock);

  // Butterflies follow the mouse, and scatter from a click or tap.
  // With no mouse (touch screens, or the cursor off the page) they flow
  // from the bottom left to the top right.
  window.addEventListener("pointermove", (e) => {
    flock.pointer = e.pointerType === "mouse" ? { x: e.clientX, y: e.clientY } : null;
  });
  document.documentElement.addEventListener("pointerleave", () => (flock.pointer = null));
  window.addEventListener("pointerdown", (e) => flock.scatter(e.clientX, e.clientY));

  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      flock.resize();
      burst.resize();
      // Phones fire resize when the address bar hides: only reseed on a real width change.
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        flock.seed();
      }
    }, 150);
  });
}

/* ---------- Motion on the home page ---------- */

function setupMotion() {
  if (reduced) return;

  // Entrance: the name decodes, the rest settles in just behind it.
  decode(document.getElementById("name"), { duration: 450 });
  animate(".hero-intro", { opacity: [0, 1], y: [14, 0], filter: ["blur(6px)", "blur(0px)"] }, { duration: 0.7, delay: 0.25, ease: EASE_OUT });
  animate(".hero-nav, .hero-cue", { opacity: [0, 1] }, { duration: 0.6, delay: 0.45, ease: "easeOut" });

  // The intro drifts up and fades as the sheet of work slides over the field.
  scroll(animate(".hero-copy", { opacity: [1, 0], y: [0, -70] }, { ease: "linear" }), {
    target: hero,
    offset: ["start start", "end start"],
  });

  // Each discipline pulls into focus as it crosses the middle of the screen.
  for (const li of document.querySelectorAll(".focus-list li")) {
    scroll(
      animate(li, { opacity: [0.2, 1, 1, 0.2], filter: ["blur(7px)", "blur(0px)", "blur(0px)", "blur(7px)"] }, { ease: "linear" }),
      { target: li, offset: ["start end", "start 0.72", "end 0.3", "end start"] },
    );
  }

  // Cards rise in once, the first time they are seen.
  for (const card of document.querySelectorAll(".card")) {
    card.style.opacity = "0";
    inView(card, () => {
      animate(card, { opacity: [0, 1], y: [28, 0] }, { duration: 0.7, ease: EASE_OUT });
    }, { amount: 0.15 });
  }
}

/* ---------- Moving between the home page and a case study ---------- */

let current = null; // the open project, or null on the home page
let savedScroll = 0;
let clickedCover = null;

document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#/work/"]');
  clickedCover = link ? link.querySelector(".cover") : null;
});

function jump(top) {
  window.scrollTo({ top, behavior: "instant" });
}

// Runs a change to the page inside a view transition when the browser
// supports it, so the project cover can grow into the case-study header.
function transition(update) {
  if (reduced || !document.startViewTransition) {
    update();
    return Promise.resolve(false);
  }
  return document.startViewTransition(update).finished.then(() => true, () => true);
}

function openCase(project) {
  const source = clickedCover;
  const fromHome = current === null;
  clickedCover = null;
  if (fromHome) savedScroll = window.scrollY;

  // Mark the clicked cover as the one that morphs.
  const oldCaseCover = caseEl.querySelector(".case-cover");
  if (oldCaseCover) oldCaseCover.style.viewTransitionName = "none";
  if (source) source.style.viewTransitionName = "cover";

  if (source && !reduced) {
    const r = source.getBoundingClientRect();
    burst.resize();
    burst.burst(r.left + r.width / 2, r.top + r.height / 2, 5);
  }

  const done = transition(() => {
    if (source) source.style.viewTransitionName = "";
    renderCase(project);
    home.hidden = true;
    caseEl.hidden = false;
    document.body.classList.add("is-case");
    jump(0);
    const title = caseEl.querySelector(".case-title");
    title.focus({ preventScroll: true });
    if (!reduced) decode(title, { duration: 400 });
  });

  current = project;
  document.title = `${project.title} · Maia Branson`;
  updateFlock();

  done.then((morphed) => {
    // Browsers without view transitions get a simple fade instead.
    if (!morphed && !reduced) animate(caseEl, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, ease: EASE_OUT });
  });
}

function showHome() {
  if (current === null) return; // already home: the browser handles #work, #about, #contact
  const slug = current.slug;
  const target = document.querySelector(location.hash && !location.hash.startsWith("#/") && location.hash !== "#work" ? location.hash : "nothing");
  let card;

  transition(() => {
    caseEl.hidden = true;
    home.hidden = false;
    document.body.classList.remove("is-case");
    if (target) target.scrollIntoView({ behavior: "instant" });
    else jump(savedScroll);
    card = document.querySelector(`.card[data-slug="${slug}"] .cover`);
    if (card) card.style.viewTransitionName = "cover";
  }).then(() => {
    if (card) card.style.viewTransitionName = "";
  });

  current = null;
  document.title = "Maia Branson";
  updateFlock();
}

function route() {
  const match = location.hash.match(/^#\/work\/([\w-]+)/);
  const project = match && projects.find((p) => p.slug === match[1]);
  if (project) {
    if (project !== current) openCase(project);
  } else {
    showHome();
  }
}

/* ---------- Start ---------- */

const timeout = new Promise((resolve) => setTimeout(resolve, 1200));
const fonts = Promise.all([
  document.fonts.load('500 12px "Geist Mono Variable"'),
  document.fonts.load('500 48px "Host Grotesk Variable"'),
]);

Promise.race([fonts, timeout]).then(() => {
  renderHome();
  setupFlock();
  setupMotion();
  window.addEventListener("hashchange", route);
  route();
});
