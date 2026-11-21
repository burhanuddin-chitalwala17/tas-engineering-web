(function () {
  var T = window.TAS, esc = T.esc;
  var D = T.load();
  var lineById = {};
  D.lines.forEach(function (l) { lineById[l.id] = l; });
  var state = { line: null, q: "", inStock: false };
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- business details everywhere ---------- */
  function paintBusiness() {
    var b = D.business;
    document.querySelectorAll("[data-b]").forEach(function (el) { el.textContent = b[el.getAttribute("data-b")] || ""; });
    $("#banner").textContent = b.banner || "";
    var wa = T.waLink(b.whatsapp, "Hi TAS Engineering, I have an enquiry.");
    var hw = $("#heroWa");
    if (wa) { hw.href = wa; } else { hw.href = "#"; hw.onclick = function (e) { e.preventDefault(); noWa("Hi TAS Engineering, I have an enquiry."); }; }
    $("#plDate").textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ---------- product lines ---------- */
  function paintLines() {
    $("#lineGrid").innerHTML = D.lines.map(function (l) {
      var n = D.products.filter(function (p) { return p.line === l.id; }).length;
      return '<button class="line-card" type="button" data-line="' + l.id + '" aria-pressed="' + (state.line === l.id) + '">' +
        T.icon(l.icon, 56) + '<b>' + esc(l.name) + '</b><span>' + esc(l.blurb) + '</span><span class="n">' + n + ' products →</span></button>';
    }).join("");
  }
  $("#lineGrid").addEventListener("click", function (e) {
    var b = e.target.closest("[data-line]"); if (!b) return;
    state.line = state.line === b.dataset.line ? null : b.dataset.line;
    paintLines(); paintProducts();
    document.getElementById("products").scrollIntoView();
  });
  $("#clearFilter").onclick = function () { state.line = null; state.q = ""; $("#q").value = ""; paintLines(); paintProducts(); };
  $("#inStock").onchange = function (e) { state.inStock = e.target.checked; paintProducts(); };

  /* ---------- products ---------- */
  function matches(p) {
    if (state.line && p.line !== state.line) return false;
    if (state.inStock && p.stock !== "in") return false;
    if (state.q) {
      var hay = (p.name + " " + p.sizes + " " + p.spec + " " + (lineById[p.line] || {}).name).toLowerCase()
        .replace(/["”]/g, " inch ").replace(/\binch(es)?\b/g, " inch ");
      var words = state.q.toLowerCase().replace(/["”]/g, " inch ").split(/\s+/).filter(Boolean);
      return words.every(function (w) { return hay.indexOf(w.replace(/es$|s$/, "")) > -1; });
    }
    return true;
  }
  function paintProducts() {
    var list = D.products.filter(matches);
    var title = state.line ? lineById[state.line].name : state.q ? 'Results for “' + state.q + '”' : "All products";
    $("#prodTitle").textContent = title;
    $("#clearFilter").setAttribute("aria-pressed", String(!state.line && !state.q));
    if (!list.length) {
      $("#productGrid").innerHTML = '<div class="empty" style="grid-column:1/-1">Nothing matches that yet. <a href="#identify">Send us a photo</a> and we\'ll find it. We stock far more than what\'s listed online.</div>';
      return;
    }
    $("#productGrid").innerHTML = list.map(function (p) {
      var l = lineById[p.line] || {};
      var sizes = String(p.sizes || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      return '<article class="product">' +
        '<div class="pic"><span class="stock ' + p.stock + '">' + (p.stock === "in" ? "● In stock" : "◐ On order") + '</span>' + T.icon(l.icon, 96) + '</div>' +
        '<div class="body"><span class="eyebrow">' + esc(l.name) + '</span><h3>' + esc(p.name) + '</h3><span class="spec">' + esc(p.spec) + '</span></div>' +
        '<div class="foot">' +
        (p.showPrice ? '<span class="price">' + T.inr(p.price) + ' <small>onwards, per piece</small></span>' : '<span class="ask">Price on request</span>') +
        '<div class="act"><select aria-label="Size" data-size="' + p.id + '">' + sizes.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join("") + '</select>' +
        '<input type="number" min="1" value="1" aria-label="Quantity" data-qty="' + p.id + '">' +
        '<button class="btn sm" type="button" data-add="' + p.id + '">Add</button></div></div></article>';
    }).join("");
  }
  $("#productGrid").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var id = b.dataset.add, p = D.products.find(function (x) { return x.id === id; });
    var size = document.querySelector('[data-size="' + id + '"]').value;
    var qty = Math.max(1, parseInt(document.querySelector('[data-qty="' + id + '"]').value, 10) || 1);
    addToBasket(p, size, qty);
  });

  /* ---------- search ---------- */
  var qEl = $("#q"), qTimer;
  qEl.addEventListener("input", function () {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () { state.q = qEl.value.trim(); state.line = null; paintLines(); paintProducts(); }, 120);
  });
  qEl.addEventListener("keydown", function (e) { if (e.key === "Enter") document.getElementById("products").scrollIntoView(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); qEl.focus(); }
  });

  /* ---------- basket ---------- */
  function getBasket() { try { return JSON.parse(localStorage.getItem("tas-basket") || "[]"); } catch (e) { return []; } }
  function setBasket(b) { try { localStorage.setItem("tas-basket", JSON.stringify(b)); } catch (e) {} $("#basketCount").textContent = b.reduce(function (n, i) { return n + 1; }, 0); }
  function addToBasket(p, size, qty) {
    var b = getBasket(), found = b.find(function (i) { return i.id === p.id && i.size === size; });
    if (found) found.qty += qty; else b.push({ id: p.id, name: p.name, size: size, qty: qty, price: p.showPrice ? p.price : null });
    setBasket(b); toast("Added: " + p.name + " · " + size + " × " + qty);
  }
  function basketText(b, name, phone) {
    return "Quote request — " + D.business.name + "\n" + (name ? "From: " + name + "\n" : "") + (phone ? "Mobile: " + phone + "\n" : "") + "\n" +
      b.map(function (i, n) { return (n + 1) + ". " + i.name + " — " + i.size + " × " + i.qty; }).join("\n") + "\n\nPlease share price and availability.";
  }
  function openBasket() {
    var b = getBasket();
    var ov = document.createElement("div"); ov.className = "overlay";
    var dr = document.createElement("aside"); dr.className = "drawer"; dr.setAttribute("aria-label", "Quote basket");
    function close() { ov.remove(); dr.remove(); }
    function render() {
      b = getBasket();
      var est = b.reduce(function (s, i) { return s + (i.price ? i.price * i.qty : 0); }, 0);
      dr.innerHTML = '<header><div><span class="eyebrow">Not a cart · no payment</span><h3>Quote basket</h3></div><button class="x" aria-label="Close">×</button></header>' +
        '<div class="items">' + (b.length ? b.map(function (i, n) {
          return '<div class="item"><div><b>' + esc(i.name) + '</b><div class="mono">' + esc(i.size) + (i.price ? ' · ' + T.inr(i.price) + ' each' : ' · price on request') + '</div></div>' +
            '<div class="qty"><button data-dec="' + n + '" aria-label="Less">−</button><span class="mono">' + i.qty + '</span><button data-inc="' + n + '" aria-label="More">+</button></div></div>';
        }).join("") : '<div class="empty">Your basket is empty. Add parts from the catalogue and send them all for one quote.</div>') + '</div>' +
        '<footer>' + (b.length ? '<div class="muted" style="font-size:.85rem">Indicative total for listed prices: <b class="mono">' + T.inr(est) + '</b>. Final price on quote.</div>' +
        '<div class="two"><input id="bName" placeholder="Your name / company"><input id="bPhone" type="tel" placeholder="Mobile number"></div>' +
        '<button class="btn wa" data-send>Send for quote on WhatsApp</button><button class="btn ghost sm" data-slip>Print / save parts slip</button>' : '') + '</footer>';
    }
    render();
    dr.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest(".x")) return close();
      if (t.dataset.inc || t.dataset.dec) {
        var i = +(t.dataset.inc || t.dataset.dec), bb = getBasket();
        bb[i].qty += t.dataset.inc ? 1 : -1; if (bb[i].qty < 1) bb.splice(i, 1);
        setBasket(bb); render(); return;
      }
      if (t.hasAttribute("data-send")) {
        var name = $("#bName").value.trim(), phone = $("#bPhone").value.trim();
        if (!/\d{10}/.test(phone.replace(/\D/g, ""))) { toast("Please enter a 10-digit mobile number"); $("#bPhone").focus(); return; }
        var text = basketText(getBasket(), name, phone);
        T.addLead({ type: "Quote basket", name: name, phone: phone, detail: getBasket().map(function (i) { return i.name + " " + i.size + " ×" + i.qty; }).join("; ") });
        sendWa(text); setBasket([]); close();
      }
      if (t.hasAttribute("data-slip")) {
        var bb2 = getBasket();
        $("#slip").innerHTML = '<h2>Parts slip — ' + esc(D.business.name) + '</h2><p>' + esc(D.business.address) + ' · ' + esc(D.business.phones) + '</p><hr><table><tr><th>#</th><th>Item</th><th>Size</th><th>Qty</th></tr>' +
          bb2.map(function (i, n) { return '<tr><td>' + (n + 1) + '</td><td>' + esc(i.name) + '</td><td>' + esc(i.size) + '</td><td>' + i.qty + '</td></tr>'; }).join("") + '</table><p style="margin-top:20px">Prepared ' + new Date().toLocaleString("en-IN") + '</p>';
        window.print();
      }
    });
    ov.onclick = close;
    document.body.append(ov, dr);
    dr.querySelector(".x").focus();
  }
  $("#openBasket").onclick = openBasket;

  /* ---------- identify a part ---------- */
  var photoData = "";
  $("#photo").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var s = Math.min(1, 480 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = img.width * s; c.height = img.height * s; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      photoData = c.toDataURL("image/jpeg", 0.7);
      $("#drop").classList.add("has");
      $("#dropText").innerHTML = '<img src="' + photoData + '" alt="Your part"><span class="muted" style="font-size:.8rem">Tap to change photo</span>';
    };
    img.src = url;
  });
  $("#identifyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var phone = $("#idPhone").value.trim(), name = $("#idName").value.trim(), note = $("#idNote").value.trim();
    if (!/\d{10}/.test(phone.replace(/\D/g, ""))) { toast("Please enter a 10-digit mobile number"); return; }
    if (!photoData) { toast("Add a photo of the part first"); return; }
    T.addLead({ type: "Identify a part", name: name, phone: phone, detail: note, photo: photoData });
    sendWa("Hi TAS Engineering, please identify this part and share the price." + (note ? "\nNote: " + note : "") + "\nName: " + (name || "-") + "\nMobile: " + phone + "\n(I'm sending the photo in the next message.)");
    e.target.reset(); photoData = ""; $("#drop").classList.remove("has");
    $("#dropText").innerHTML = '✅ <b>Sent!</b><br><span class="muted" style="font-size:.85rem">We\'ll reply on WhatsApp. Send another?</span>';
  });

  /* ---------- thread finder ---------- */
  var TPI = {
    "11": ["BSP, ½\" to 2\"", "British pipe thread. Most common on brass compression fittings, G.M. valves and plumbing in India.", "valve"],
    "11.5": ["NPT, 1\" to 2\"", "American tapered pipe thread. Found on imported pumps and US-standard equipment.", "valve"],
    "14": ["BSP ½\" or ¾\" — or NPT ½\" or ¾\"", "Both standards use 14 TPI here. Check the shape: parallel means BSPP; tapered means BSPT or NPT.", "fitting"],
    "18": ["NPT ¼\" or ⅜\"", "Common on gauges, pneumatic ports and imported instruments.", "gauge"],
    "19": ["BSP ¼\" or ⅜\"", "The usual thread on FRL units, pressure gauges and pneumatic fittings in India.", "frl"],
    "27": ["NPT ⅛\"", "Small instrument ports and gauge connections.", "gauge"],
    "28": ["BSP ⅛\"", "Small pneumatic and instrument ports.", "pneumatic"]
  };
  var current = "19";
  function paintTpi() {
    $("#tpi").innerHTML = Object.keys(TPI).map(function (k) { return '<button class="chip" type="button" data-t="' + k + '" aria-pressed="' + (k === current) + '">' + k + '</button>'; }).join("");
    var a = TPI[current];
    $("#tpiAnswer").innerHTML = '<span class="eyebrow">Most likely</span><b>' + a[0] + '</b><span>' + a[1] + '</span>';
    var g = "", n = Math.round(Math.min(28, +current)), step = 100 / n;
    for (var i = 0; i < Math.round(300 / step); i++) { var x = 40 + i * step; g += '<line x1="' + x + '" y1="60" x2="' + (x + step / 2) + '" y2="120"/>'; }
    $("#threadLines").innerHTML = g;
  }
  $("#tpi").addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (b) { current = b.dataset.t; paintTpi(); } });
  $("#tpiShop").onclick = function () {
    var q = { valve: "valve", fitting: "", gauge: "gauge", frl: "", pneumatic: "" }[TPI[current][2]];
    var lineMap = { fitting: "fittings", frl: "frl", pneumatic: "pneumatic" };
    state.q = q || ""; state.line = q ? null : lineMap[TPI[current][2]];
    $("#q").value = state.q; paintLines(); paintProducts(); document.getElementById("products").scrollIntoView();
  };

  /* ---------- price list ---------- */
  function paintPriceList() {
    $("#plBody").innerHTML = D.products.map(function (p) {
      return '<tr><td>' + esc(p.name) + '</td><td>' + esc((lineById[p.line] || {}).name) + '</td><td>' + esc(p.sizes) + '</td><td class="num">' + (p.showPrice ? T.inr(p.price) : "On request") + '</td><td>' + (p.stock === "in" ? "In stock" : "On order") + '</td></tr>';
    }).join("");
    var unlocked = false; try { unlocked = localStorage.getItem("tas-pl") === "1"; } catch (e) {}
    if (unlocked) { $("#pricelist").classList.remove("locked"); $("#lock").hidden = true; }
  }
  $("#unlockForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var phone = $("#plPhone").value.trim();
    if (!/\d{10}/.test(phone.replace(/\D/g, ""))) { toast("Please enter a 10-digit mobile number"); return; }
    T.addLead({ type: "Price list unlock", phone: phone, detail: "Viewed full price list" });
    try { localStorage.setItem("tas-pl", "1"); } catch (e2) {}
    $("#pricelist").classList.remove("locked"); $("#lock").hidden = true; toast("Price list unlocked");
  });

  /* ---------- WhatsApp ---------- */
  function sendWa(text) {
    var link = T.waLink(D.business.whatsapp, text);
    if (link) window.open(link, "_blank", "noopener"); else noWa(text);
  }
  function noWa(text) {
    var m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="box" role="dialog" aria-label="Message preview"><h3>Your request is in ✅</h3><p class="muted">In this demo no WhatsApp number is set yet, so here is the message TAS would receive. Set the number in Admin → Business details to open WhatsApp directly.</p><pre></pre><button class="btn">Close</button></div>';
    m.querySelector("pre").textContent = text;
    m.querySelector("button").onclick = function () { m.remove(); };
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    document.body.append(m);
  }

  /* ---------- toast ---------- */
  var tt;
  function toast(msg) {
    var el = document.querySelector(".toast") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "toast" }));
    el.textContent = msg; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600);
  }

  /* ---------- pressure gauge scroll ---------- */
  var ticks = document.getElementById("ticks");
  for (var i = 0; i <= 10; i++) {
    var a = (-90 + i * 18) * Math.PI / 180, r1 = i % 5 ? 40 : 35;
    var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", 60 + r1 * Math.sin(a)); l.setAttribute("y1", 60 - r1 * Math.cos(a));
    l.setAttribute("x2", 60 + 44 * Math.sin(a)); l.setAttribute("y2", 60 - 44 * Math.cos(a));
    ticks.appendChild(l);
  }
  function gauge() {
    var h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
    document.getElementById("needle").style.transform = "rotate(" + (-90 + p * 180) + "deg)";
    document.getElementById("read").textContent = (p * 10).toFixed(1) + " bar";
  }
  addEventListener("scroll", gauge, { passive: true }); addEventListener("resize", gauge);

  /* ---------- live refresh when admin saves in another tab ---------- */
  addEventListener("storage", function (e) {
    if (e.key === "tas-demo-v1") { D = T.load(); paintBusiness(); paintLines(); paintProducts(); paintPriceList(); toast("Updated from admin panel"); }
  });

  paintBusiness(); paintLines(); paintProducts(); paintTpi(); paintPriceList(); setBasket(getBasket()); gauge();
})();

/* ===== landing page showpieces ===== */
(function () {
  var T = window.TAS, D = T.load();
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // big gauge ticks + labels (0..10 "bar")
  var ticks = document.getElementById("bigTicks"), nums = document.getElementById("bigNums"), NS = "http://www.w3.org/2000/svg";
  for (var i = 0; i <= 20; i++) {
    var a = (-90 + i * 9) * Math.PI / 180, major = i % 2 === 0, r1 = major ? 78 : 83;
    var l = document.createElementNS(NS, "line");
    l.setAttribute("x1", 120 + r1 * Math.sin(a)); l.setAttribute("y1", 126 - r1 * Math.cos(a));
    l.setAttribute("x2", 120 + 89 * Math.sin(a)); l.setAttribute("y2", 126 - 89 * Math.cos(a));
    if (!major) l.setAttribute("stroke-width", "1");
    ticks.appendChild(l);
    if (i % 4 === 0) {
      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", 120 + 66 * Math.sin(a)); t.setAttribute("y", 130 - 66 * Math.cos(a)); t.textContent = i / 2;
      nums.appendChild(t);
    }
  }

  // years counter
  var yrs = 65, el = document.getElementById("yrs");
  if (reduce) el.textContent = yrs + "+"; else {
    var t0 = performance.now() + 300;
    (function tick(now) { var p = Math.min(1, Math.max(0, (now - t0) / 1600)); el.textContent = Math.round(yrs * (1 - Math.pow(1 - p, 3))) + (p >= 1 ? "+" : ""); if (p < 1) requestAnimationFrame(tick); })(t0);
  }

  // open now (IST, Mon–Sat 10:00–20:00)
  var ist = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  var d = ist.getDay(), h = ist.getHours() + ist.getMinutes() / 60, open = d !== 0 && h >= 10 && h < 20;
  var on = document.getElementById("openNow");
  on.className = "open-now " + (open ? "open" : "closed");
  on.querySelector("span").textContent = open ? "Open now · walk in or WhatsApp" : "Closed now · WhatsApp us, we reply when we open";

  // marquee
  var items = D.lines.map(function (l) { return "<span>" + T.esc(l.name) + " <b>◆</b></span>"; }).join("");
  document.getElementById("marquee").innerHTML = items + items;

  // product count
  document.getElementById("prodCount").textContent = D.products.length;

  // floating parts with mouse parallax
  var F = document.getElementById("floaters");
  var spots = [[4, 8, 90, "ball"], [78, 2, 120, "gauge"], [60, 40, 70, "fitting"], [88, 62, 100, "gate"], [30, 70, 80, "solenoid"], [48, 4, 60, "cock"], [12, 52, 70, "frl"], [70, 84, 64, "meter"]];
  F.innerHTML = spots.map(function (s) { return '<span style="left:' + s[0] + '%;top:' + s[1] + '%" data-depth="' + (s[2] / 60) + '">' + T.icon(s[3], s[2]) + "</span>"; }).join("");
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      F.querySelectorAll("span").forEach(function (s) { var k = +s.dataset.depth * 26; s.style.transform = "translate(" + (-x * k) + "px," + (-y * k) + "px)"; });
    });
  }

  // reveal on scroll (content is visible by default; this only adds an entrance)
  if (!reduce && "IntersectionObserver" in window) {
    document.querySelectorAll(".block .head, .lines, .identify, .tools, .story, .visit, .numbers").forEach(function (el) {
      el.classList.add("reveal");
      var r = el.getBoundingClientRect(); if (r.top < innerHeight) return;
      new IntersectionObserver(function (es, o) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); o.unobserve(x.target); } }); }, { threshold: .15 }).observe(el);
    });
  }
})();
