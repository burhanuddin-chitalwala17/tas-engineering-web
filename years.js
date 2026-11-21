// Years badge shows "65+" rather than an exact count (owner's request).
(function () {
  var el = document.getElementById("yrs"); if (!el) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = "65+"; return; }
  var t0 = performance.now() + 300, stop = false;
  function tick(now) {
    var p = Math.min(1, Math.max(0, (now - t0) / 1600));
    el.textContent = Math.round(65 * (1 - Math.pow(1 - p, 3))) + (p >= 1 ? "+" : "");
    if (p < 1) requestAnimationFrame(tick); else stop = true;
  }
  requestAnimationFrame(tick);
  // keep the final value even if app.js's own counter finishes later
  setTimeout(function () { el.textContent = "65+"; }, 2400);
})();
