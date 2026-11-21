// Shared store + helpers for the site and the admin panel (demo: browser storage).
(function () {
  var KEY = "tas-demo-v1";
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() {
    var d = clone(window.TAS_DEFAULTS);
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (saved) {
      if (saved.business) d.business = Object.assign(d.business, saved.business);
      if (saved.products) d.products = saved.products;
      d.leads = saved.leads || [];
    } else d.leads = [];
    return d;
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify({ business: d.business, products: d.products, leads: d.leads })); return true; }
    catch (e) { return false; }
  }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem("tas-basket"); } catch (e) {} }
  function addLead(lead) {
    var d = load();
    lead.id = "L" + Date.now();
    lead.at = new Date().toISOString();
    lead.status = "new";
    d.leads.unshift(lead);
    if (!save(d)) { lead.photo = ""; d.leads[0] = lead; save(d); }
    return lead;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function inr(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function waLink(num, text) {
    var n = String(num || "").replace(/\D/g, "");
    if (!n) return "";
    if (n.length === 10) n = "91" + n;
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(text);
  }

  // Line-drawing icons, McMaster style, one per product line.
  var P = 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    frl: '<rect x="10" y="22" width="12" height="20" rx="2"/><rect x="26" y="18" width="12" height="24" rx="2"/><rect x="42" y="22" width="12" height="20" rx="2"/><path d="M4 30h6M22 30h4M38 30h4M54 30h6M32 18v-6h-4h8"/><path d="M14 42v8h4v-8M46 42v8h4v-8"/>',
    pneumatic: '<path d="M6 32h14M44 32h14"/><rect x="20" y="24" width="24" height="16" rx="3"/><path d="M26 24v16M38 24v16"/><circle cx="32" cy="32" r="3"/>',
    solenoid: '<rect x="22" y="8" width="20" height="22" rx="2"/><path d="M26 14h12M26 19h12M26 24h12"/><path d="M8 40h12l4-6h16l4 6h12"/><path d="M8 50h48M8 40v10M56 40v10"/>',
    fitting: '<path d="M6 28h10v8H6zM48 28h10v8H48z"/><path d="M16 24h8v16h-8zM40 24h8v16h-8z"/><path d="M24 26h16v12H24z"/><path d="M28 26v12M32 26v12M36 26v12"/>',
    meter: '<circle cx="32" cy="30" r="16"/><circle cx="32" cy="30" r="10"/><path d="M4 46h12v-6h32v6h12"/><path d="M28 28h8M32 24v4"/>',
    gauge: '<circle cx="32" cy="28" r="20"/><path d="M32 28l10-8"/><path d="M18 34a14 14 0 0 1 28 0" stroke-dasharray="2 4"/><circle cx="32" cy="28" r="2.5"/><path d="M28 48h8v10h-8z"/>',
    gate: '<path d="M32 6v12"/><path d="M22 6h20"/><path d="M26 18h12v8H26z"/><path d="M6 36h8v12H6zM50 36h8v12h-8z"/><path d="M14 34h36v16H14z"/><path d="M32 26v8"/>',
    boiler: '<rect x="24" y="6" width="16" height="52" rx="3"/><path d="M28 12v40"/><path d="M28 30h8"/><path d="M14 14h10M14 50h10M40 14h10M40 50h10"/>',
    ball: '<path d="M6 28h10v8H6zM48 28h10v8H48z"/><path d="M16 22h32v20H16z"/><circle cx="32" cy="32" r="6"/><path d="M32 22v-8h18"/>',
    cock: '<path d="M8 36h48"/><path d="M8 30h48v12H8z"/><path d="M26 30V18h12v12"/><path d="M20 14h24"/>'
  };
  function icon(name, size) {
    return '<svg viewBox="0 0 64 64" width="' + (size || 64) + '" height="' + (size || 64) + '" aria-hidden="true" ' + P + '>' + (ICONS[name] || ICONS.fitting) + '</svg>';
  }

  window.TAS = { load: load, save: save, reset: reset, addLead: addLead, esc: esc, inr: inr, waLink: waLink, icon: icon };
})();
