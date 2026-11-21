(function () {
  var T = window.TAS, esc = T.esc;
  var D = T.load();
  var view = document.getElementById("view");
  var tab = "dash";

  /* ---------- login (demo only) ---------- */
  var authed = false; try { authed = sessionStorage.getItem("tas-admin") === "1"; } catch (e) {}
  function enter() { document.getElementById("login").hidden = true; document.getElementById("app").hidden = false; render(); }
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (document.getElementById("pw").value === "tas2026") { try { sessionStorage.setItem("tas-admin", "1"); } catch (e2) {} enter(); }
    else toast("Wrong password");
  });
  if (authed) enter();

  document.querySelector(".side").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (!b) return;
    tab = b.dataset.tab;
    document.querySelectorAll(".side [data-tab]").forEach(function (x) { x.setAttribute("aria-current", String(x === b)); });
    render();
  });

  function persist(msg) { if (T.save(D)) toast(msg || "Saved. The website is updated."); else toast("Could not save (browser storage full)"); updatePill(); }
  function updatePill() { document.getElementById("newCount").textContent = D.leads.filter(function (l) { return l.status === "new"; }).length; }
  function lineName(id) { var l = D.lines.find(function (x) { return x.id === id; }); return l ? l.name : id; }
  function when(iso) { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }); }

  function render() {
    D = T.load(); updatePill();
    ({ dash: dash, leads: leads, products: products, import: importer, business: business, banner: banner, demo: demo })[tab]();
  }

  /* ---------- overview ---------- */
  function dash() {
    var L = D.leads, by = function (t) { return L.filter(function (l) { return l.type === t; }).length; };
    view.innerHTML = '<div class="bar"><div><span class="eyebrow">Good to see you, ' + esc(D.business.proprietor) + '</span><h2>Overview</h2></div><a class="btn ghost sm" href="index.html" target="_blank">View website ↗</a></div>' +
      '<div class="stats">' +
      stat(L.filter(function (l) { return l.status === "new"; }).length, "New leads to answer") +
      stat(by("Identify a part"), "Photo enquiries") + stat(by("Quote basket"), "Basket quotes") + stat(by("Price list unlock"), "Price list views") + '</div>' +
      '<div class="panel"><h3>Latest leads</h3>' + (L.length ? leadTable(L.slice(0, 5), true) : emptyLeads()) + '</div>' +
      '<div class="note"><b>Try this:</b> open the website in another tab, then change a phone number or a price here. The website updates straight away.</div>';
  }
  function stat(n, t) { return '<div class="stat"><b>' + n + '</b><span class="muted" style="font-size:.85rem">' + t + '</span></div>'; }
  function emptyLeads() { return '<p class="muted">No leads yet. Go to the website and try “Send a photo”, the quote basket or the price list. Or load sample leads from Demo settings.</p>'; }

  /* ---------- leads ---------- */
  function leadTable(list, compact) {
    return '<div class="tbl"><table><thead><tr><th>When</th><th>Type</th><th>Name</th><th>Mobile</th><th>Details</th>' + (compact ? '' : '<th>Photo</th>') + '<th>Status</th></tr></thead><tbody>' +
      list.map(function (l) {
        var wa = T.waLink(l.phone, "Hi " + (l.name || "") + ", this is " + D.business.name + " regarding your enquiry.");
        return '<tr><td class="mono" style="white-space:nowrap">' + when(l.at) + '</td><td>' + esc(l.type) + '</td><td>' + esc(l.name || "—") + '</td>' +
          '<td class="mono">' + (wa ? '<a href="' + wa + '" target="_blank" rel="noopener">' + esc(l.phone) + '</a>' : esc(l.phone)) + '</td><td style="max-width:320px">' + esc(l.detail || "") + '</td>' +
          (compact ? '' : '<td>' + (l.photo ? '<img class="thumb" src="' + l.photo + '" alt="Part photo">' : '—') + '</td>') +
          '<td><select data-status="' + l.id + '">' + ["new", "replied", "quoted", "won", "lost"].map(function (s) { return '<option' + (s === l.status ? ' selected' : '') + '>' + s + '</option>'; }).join("") + '</select></td></tr>';
      }).join("") + '</tbody></table></div>';
  }
  function leads() {
    view.innerHTML = '<div class="bar"><div><span class="eyebrow">Every enquiry from the website</span><h2>Leads</h2></div><button class="btn sm" id="exportLeads">Download as Excel</button></div>' +
      '<div class="panel">' + (D.leads.length ? leadTable(D.leads) : emptyLeads()) + '</div>' +
      '<p class="muted" style="font-size:.85rem">Tap a mobile number to reply on WhatsApp. In the live build, each new lead is also sent to the owner\'s WhatsApp.</p>';
    document.getElementById("exportLeads").onclick = function () {
      var rows = D.leads.map(function (l) { return { Date: when(l.at), Type: l.type, Name: l.name || "", Mobile: l.phone, Details: l.detail || "", Status: l.status }; });
      xlsxDownload(rows, "TAS-leads.xlsx", "Leads");
    };
  }
  view.addEventListener("change", function (e) {
    var s = e.target.closest("[data-status]"); if (!s) return;
    var l = D.leads.find(function (x) { return x.id === s.dataset.status; }); if (l) { l.status = s.value; persist("Lead marked " + s.value); }
  });

  /* ---------- products ---------- */
  function products() {
    view.innerHTML = '<div class="bar"><div><span class="eyebrow">' + D.products.length + ' products</span><h2>Products &amp; prices</h2></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" id="addP">+ Add product</button><button class="btn sm red" id="saveP">Save changes</button></div></div>' +
      '<div class="panel"><div class="tbl"><table><thead><tr><th>Product</th><th>Line</th><th>Sizes (comma separated)</th><th>Spec</th><th>Price ₹</th><th>Show price</th><th>Stock</th><th></th></tr></thead><tbody id="pBody">' +
      D.products.map(prodRow).join("") + '</tbody></table></div></div>';
    document.getElementById("addP").onclick = function () {
      var p = { id: "p" + Date.now(), line: D.lines[0].id, name: "", sizes: "", spec: "", price: 0, showPrice: true, stock: "in" };
      document.getElementById("pBody").insertAdjacentHTML("afterbegin", prodRow(p));
      document.querySelector('#pBody tr input').focus();
    };
    document.getElementById("saveP").onclick = function () {
      var rows = document.querySelectorAll("#pBody tr");
      D.products = Array.prototype.map.call(rows, function (r) {
        var g = function (k) { return r.querySelector('[data-k="' + k + '"]'); };
        return { id: r.dataset.id, name: g("name").value.trim(), line: g("line").value, sizes: g("sizes").value, spec: g("spec").value,
          price: Number(g("price").value) || 0, showPrice: g("showPrice").checked, stock: g("stock").value };
      }).filter(function (p) { return p.name; });
      persist("Saved " + D.products.length + " products. The website is updated.");
      render();
    };
    document.getElementById("pBody").addEventListener("click", function (e) {
      if (e.target.classList.contains("rowbtn")) e.target.closest("tr").remove();
    });
  }
  function prodRow(p) {
    return '<tr data-id="' + esc(p.id) + '"><td><input data-k="name" value="' + esc(p.name) + '" placeholder="Product name"></td>' +
      '<td><select data-k="line">' + D.lines.map(function (l) { return '<option value="' + l.id + '"' + (l.id === p.line ? " selected" : "") + '>' + esc(l.name) + '</option>'; }).join("") + '</select></td>' +
      '<td><input data-k="sizes" value="' + esc(p.sizes) + '"></td><td><input data-k="spec" value="' + esc(p.spec) + '"></td>' +
      '<td><input data-k="price" type="number" min="0" value="' + esc(p.price) + '" style="width:100px"></td>' +
      '<td style="text-align:center"><input data-k="showPrice" type="checkbox" style="width:auto"' + (p.showPrice ? " checked" : "") + '></td>' +
      '<td><select data-k="stock"><option value="in"' + (p.stock === "in" ? " selected" : "") + '>In stock</option><option value="order"' + (p.stock === "order" ? " selected" : "") + '>On order</option></select></td>' +
      '<td><button class="rowbtn" type="button">Remove</button></td></tr>';
  }

  /* ---------- price list upload ---------- */
  function importer() {
    view.innerHTML = '<div><span class="eyebrow">Excel or CSV</span><h2>Upload price list</h2></div>' +
      '<div class="panel"><p>Upload your price list in Excel. Products are matched by name: prices and stock are updated, and new names are added as new products.</p>' +
      '<p class="muted" style="font-size:.9rem">Columns: <span class="mono">Product, Line, Sizes, Spec, Price, Show price (yes/no), Stock (in/order)</span></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost sm" id="tpl">Download current list as Excel</button>' +
      '<label class="btn sm" style="display:inline-flex;cursor:pointer">Choose Excel file<input id="file" type="file" accept=".xlsx,.xls,.csv" hidden></label></div>' +
      '<div id="preview"></div></div>';
    document.getElementById("tpl").onclick = function () {
      xlsxDownload(D.products.map(function (p) { return { Product: p.name, Line: lineName(p.line), Sizes: p.sizes, Spec: p.spec, Price: p.price, "Show price": p.showPrice ? "yes" : "no", Stock: p.stock }; }), "TAS-price-list.xlsx", "Price list");
    };
    document.getElementById("file").onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      if (!window.XLSX) { toast("Excel reader didn't load. Check your internet connection."); return; }
      var r = new FileReader();
      r.onload = function () {
        var wb = XLSX.read(r.result, { type: "array" });
        var rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        var updated = 0, added = 0, next = D.products.slice();
        rows.forEach(function (row) {
          var g = function (k) { var key = Object.keys(row).find(function (x) { return x.toLowerCase().trim() === k; }); return key ? row[key] : ""; };
          var name = String(g("product") || g("name")).trim(); if (!name) return;
          var lineTxt = String(g("line")).toLowerCase();
          var line = (D.lines.find(function (l) { return l.name.toLowerCase() === lineTxt || l.id === lineTxt; }) || {}).id;
          var ex = next.find(function (p) { return p.name.toLowerCase() === name.toLowerCase(); });
          var price = Number(String(g("price")).replace(/[^\d.]/g, "")) || 0;
          var show = String(g("show price")).toLowerCase(), stock = String(g("stock")).toLowerCase();
          if (ex) {
            if (price) ex.price = price; if (g("sizes")) ex.sizes = String(g("sizes")); if (g("spec")) ex.spec = String(g("spec"));
            if (show) ex.showPrice = show !== "no"; if (stock) ex.stock = stock.indexOf("order") > -1 ? "order" : "in"; if (line) ex.line = line; updated++;
          } else {
            next.push({ id: "p" + Date.now() + added, name: name, line: line || D.lines[0].id, sizes: String(g("sizes")), spec: String(g("spec")), price: price, showPrice: show !== "no", stock: stock.indexOf("order") > -1 ? "order" : "in" }); added++;
          }
        });
        document.getElementById("preview").innerHTML = '<div class="note">Found ' + rows.length + ' rows: <b>' + updated + '</b> products will be updated and <b>' + added + '</b> added.</div><button class="btn red" id="apply">Apply to website</button>';
        document.getElementById("apply").onclick = function () { D.products = next; persist("Price list applied. The website is updated."); tab = "products"; document.querySelector('[data-tab="products"]').click(); };
      };
      r.readAsArrayBuffer(f);
    };
  }

  /* ---------- business details ---------- */
  var FIELDS = [["name", "Business name"], ["proprietor", "Proprietor"], ["phones", "Phone numbers"], ["telefax", "Telefax"], ["whatsapp", "WhatsApp number (leads go here)"], ["email", "Email"], ["address", "Address"], ["hours", "Shop hours"], ["since", "Established (year)"]];
  function business() {
    view.innerHTML = '<div><span class="eyebrow">Shown on every page</span><h2>Business details</h2></div>' +
      '<form class="panel" id="bForm"><div class="grid2">' + FIELDS.map(function (f) {
        return '<label>' + f[1] + '<input id="b_' + f[0] + '" value="' + esc(D.business[f[0]]) + '"' + (f[0] === "whatsapp" ? ' placeholder="10-digit mobile, e.g. 98xxxxxxxx" inputmode="tel"' : "") + '></label>';
      }).join("") + '</div><div><button class="btn red" type="submit">Save details</button></div></form>';
    document.getElementById("bForm").addEventListener("submit", function (e) {
      e.preventDefault(); FIELDS.forEach(function (f) { D.business[f[0]] = document.getElementById("b_" + f[0]).value.trim(); }); persist();
    });
  }
  function banner() {
    view.innerHTML = '<div><span class="eyebrow">The strip at the top of the website</span><h2>Banner message</h2></div>' +
      '<form class="panel" id="banForm"><label>Message<input id="ban" value="' + esc(D.business.banner) + '" maxlength="140"></label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + ["New stock in: S.S. 316 ball valves, ½\" to 2\". Ask for bulk rates.", "Shop closed on Sunday. WhatsApp orders open 24×7.", "Festival offer: 5% off on bulk orders above ₹25,000."].map(function (s) { return '<button type="button" class="chip" data-s="' + esc(s) + '">' + esc(s) + '</button>'; }).join("") + '</div>' +
      '<div><button class="btn red" type="submit">Publish banner</button></div></form>';
    view.querySelectorAll("[data-s]").forEach(function (c) { c.onclick = function () { document.getElementById("ban").value = c.dataset.s; }; });
    document.getElementById("banForm").addEventListener("submit", function (e) { e.preventDefault(); D.business.banner = document.getElementById("ban").value.trim(); persist("Banner published."); });
  }

  /* ---------- demo ---------- */
  function demo() {
    view.innerHTML = '<div><span class="eyebrow">For the presentation</span><h2>Demo settings</h2></div>' +
      '<div class="panel"><p>This demo stores changes in this browser only. The live build saves to a secure database so changes show for every visitor.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="sample">Load sample leads</button><button class="btn ghost" id="reset">Reset demo to original</button></div></div>';
    document.getElementById("sample").onclick = function () {
      var now = Date.now();
      [["Identify a part", "Ravi (Peenya plant)", "98450 12345", "Need 6 of these, steam line"], ["Quote basket", "Sri Lakshmi Boilers", "99000 54321", "Water-level gauge set ¾\" ×2; Spring-loaded safety valve 1\" ×1"],
       ["Price list unlock", "", "97411 22334", "Viewed full price list"], ["Quote basket", "Arun Plumbing Works", "90080 11223", "G.M. gate valve 1\" ×12; Brass compression union ½\" ×40"]].forEach(function (s, i) {
        D.leads.unshift({ id: "S" + now + i, at: new Date(now - (i + 1) * 3600e3 * 3).toISOString(), status: i === 2 ? "replied" : "new", type: s[0], name: s[1], phone: s[2], detail: s[3] });
      });
      persist("Sample leads loaded (example data)."); tab = "leads"; document.querySelector('[data-tab="leads"]').click();
    };
    document.getElementById("reset").onclick = function () {
      var b = document.getElementById("reset");
      if (b.dataset.sure) { T.reset(); toast("Demo reset"); render(); }
      else { b.dataset.sure = "1"; b.textContent = "Click again to confirm reset"; }
    };
  }

  /* ---------- helpers ---------- */
  function xlsxDownload(rows, file, sheet) {
    if (!window.XLSX) { toast("Excel writer didn't load. Check your internet connection."); return; }
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheet); XLSX.writeFile(wb, file);
  }
  var tt;
  function toast(msg) {
    var el = document.querySelector(".toast") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "toast" }));
    el.textContent = msg; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2600);
  }
})();
