/* All behaviour here is progressive enhancement: the page is fully usable
   with JavaScript disabled, and every animation respects reduced-motion. */

const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----------------------------------------------------------------------
   1. Hero journey-canvas: draw the connector paths on page load.
   Why: the canvas is the site's signature moment; a single orchestrated
   draw-on lands harder than scattered effects elsewhere.
   ---------------------------------------------------------------------- */
if (motionOK) {
  document.querySelectorAll(".jc-paths path").forEach((path, i) => {
    const len = path.getTotalLength();
    // Set the dash to the full path length so it starts invisible...
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    // ...then transition the offset to 0, staggered per path.
    path.style.transition = `stroke-dashoffset 1.1s ease ${0.25 + i * 0.3}s`;
    // Force a reflow so the browser registers the start state before animating.
    path.getBoundingClientRect();
    requestAnimationFrame(() => (path.style.strokeDashoffset = "0"));
  });

  // Nodes fade in after their connecting lines arrive.
  document.querySelectorAll(".jc-nodes > g").forEach((node, i) => {
    node.style.opacity = "0";
    node.style.transition = `opacity 0.5s ease ${0.6 + i * 0.25}s`;
    requestAnimationFrame(() => (node.style.opacity = "1"));
  });
}

/* ----------------------------------------------------------------------
   2. Scroll reveal: sections fade up as they enter the viewport.
   Why IntersectionObserver: it's cheap (no scroll-event thrashing) and
   degrades silently in old browsers — content just shows immediately.
   ---------------------------------------------------------------------- */
const revealTargets = document.querySelectorAll(
  ".impact-item, .case, .domain, .asset, .think, .tl-item, .cert-tier"
);

if (motionOK && "IntersectionObserver" in window) {
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target); // reveal once; don't re-hide on scroll-up
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));
}

/* ----------------------------------------------------------------------
   3. Impact counters: numbers count up the first time they're seen.
   Why data-attributes: keeps the real value in the HTML so the page is
   correct without JS, and SEO/screen readers read the final number.
   ---------------------------------------------------------------------- */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic: fast start, gentle landing
    const value = Math.round(target * eased).toLocaleString("en-US");
    el.innerHTML = prefix + value + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (motionOK && "IntersectionObserver" in window) {
  const counters = document.querySelectorAll(".impact-num[data-count]");
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => cio.observe(el));
}
