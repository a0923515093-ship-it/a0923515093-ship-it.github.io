/* csv:start */
function parseCsv(text) {
  const src = String(text || "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function cell(row, i) {
  return String(row && row[i] != null ? row[i] : "").replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
}

function photoSrc(raw) {
  const url = String(raw || "").trim();
  if (!url) return "";
  const file = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (file) return "https://lh3.googleusercontent.com/d/" + file[1];
  const id = url.match(/[?&]id=([^&#]+)/i);
  if (id && /drive\.google\.com/i.test(url)) {
    let decoded = id[1];
    try { decoded = decodeURIComponent(id[1]); } catch (e) {}
    return "https://lh3.googleusercontent.com/d/" + decoded;
  }
  if (/^https?:\/\//i.test(url)) return url;
  return "";
}

function priceLabel(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  if (/^NT\$/i.test(s)) return s.replace(/^nt\$/i, "NT$");
  return "NT$" + s;
}

function productsFromCsv(text) {
  const rows = parseCsv(text);
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.some(c => String(c).trim() !== "")) continue;
    if (cell(r, 0) !== "是") continue;
    out.push({
      name: cell(r, 1),
      brand: cell(r, 2),
      model: cell(r, 3),
      category: cell(r, 4),
      price: cell(r, 5),
      note: cell(r, 6),
      photo: photoSrc(cell(r, 7))
    });
  }
  return out;
}
/* csv:end */

(function () {
  const $ = s => document.querySelector(s);
  const app = $("#app");
  const S = window.STORE;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mapSearch = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.address);
  const mapEmbed = "https://www.google.com/maps?q=" + encodeURIComponent(S.address) + "&hl=zh-TW&z=16&output=embed";
  const BASE_BRANDS = JSON.parse(JSON.stringify(window.BRANDS));
  const BASE_TYPES = JSON.parse(JSON.stringify(window.TYPES));

  let products = [];
  let loadState = "loading";

  function norm(s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function key(s) { return norm(s).replace(/[^a-z0-9\u4e00-\u9fff]+/g, ""); }
  function slug(s) {
    const n = norm(s).replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
    return "s-" + (n || "item");
  }
  function resetTaxonomy() {
    window.BRANDS = BASE_BRANDS.map(b => ({ id: b.id, name: b.name, color: b.color, models: b.models.map(m => m.slice()) }));
    window.TYPES = BASE_TYPES.map(t => ({ id: t.id, name: t.name }));
  }
  function findBrand(value) {
    const k = key(value);
    if (!k) return null;
    const exact = BRANDS.find(b => key(b.name) === k || key(b.id) === k);
    if (exact) return exact;
    if (k.length < 3) return null;
    const partial = BRANDS.filter(b => key(b.name).includes(k) || k.includes(key(b.name)));
    return partial.length === 1 ? partial[0] : null;
  }
  function findType(value) {
    const k = key(value);
    if (!k) return null;
    const exact = TYPES.find(t => key(t.name) === k || key(t.id) === k);
    if (exact) return exact;
    const partial = TYPES.filter(t => key(t.name).includes(k) || k.includes(key(t.name)));
    return partial.length === 1 ? partial[0] : null;
  }
  function findModel(brand, value) {
    const n = norm(value);
    if (!brand || !n) return null;
    const exact = brand.models.find(m => norm(m[0]) === n || norm(m[1]) === n);
    if (exact) return exact;
    const partial = brand.models.filter(m => norm(m[1]).includes(n) || n.includes(norm(m[1])));
    return partial.length === 1 ? partial[0] : null;
  }
  function uniqueId(taken, base) {
    let id = base, n = 2;
    while (taken(id)) { id = base + "-" + n; n++; }
    return id;
  }
  function placeProducts(rows) {
    resetTaxonomy();
    products = rows.map(row => {
      let brand = row.brand ? findBrand(row.brand) : null;
      if (row.brand && !brand) {
        brand = { id: uniqueId(id => BRANDS.some(b => b.id === id), slug(row.brand)), name: row.brand, color: "#8d939e", models: [] };
        BRANDS.push(brand);
      }
      let model = brand && row.model ? findModel(brand, row.model) : null;
      if (brand && row.model && !model) {
        model = [uniqueId(id => BRANDS.some(b => b.models.some(m => m[0] === id)), slug(row.model)), row.model];
        brand.models.push(model);
      }
      let type = row.category ? findType(row.category) : null;
      if (row.category && !type) {
        type = { id: uniqueId(id => TYPES.some(t => t.id === id), slug(row.category)), name: row.category };
        TYPES.push(type);
      }
      return {
        name: row.name, price: row.price, note: row.note, photo: row.photo,
        brandText: brand ? brand.name : row.brand,
        modelText: model ? model[1] : row.model,
        categoryText: type ? type.name : row.category,
        brandId: brand ? brand.id : "",
        modelId: model ? model[0] : "",
        typeId: type ? type.id : ""
      };
    });
    window.PRODUCTS = products;
  }

  function sheetCsvUrl() {
    return "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(SHEET.id) + "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(SHEET.tab);
  }

  function lineBtn(extra) {
    return `<a class="btn line${extra ? " " + extra : ""}" href="${esc(LINE_URL)}" target="_blank" rel="noopener noreferrer">LINE 詢問</a>`;
  }

  function media(p) {
    if (!p.photo) return `<div class="pimg-ph"><span>${esc(p.name)}</span></div>`;
    return `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" data-name="${esc(p.name)}">`;
  }

  function card(p) {
    const meta = [
      p.brandText ? `<p class="pmeta"><span>品牌</span> ${esc(p.brandText)}</p>` : "",
      p.modelText ? `<p class="pmeta"><span>適用車款</span> ${esc(p.modelText)}</p>` : "",
      p.categoryText ? `<p class="pmeta"><span>類別</span> ${esc(p.categoryText)}</p>` : ""
    ].join("");
    const price = priceLabel(p.price);
    return `<article class="pcard">
      <div class="pimg">${media(p)}</div>
      <div class="pbody">
        <h3>${esc(p.name)}</h3>
        ${meta}
        ${price ? `<p class="pprice">${esc(price)}</p>` : ""}
        ${p.note ? `<p class="pdesc">${esc(p.note)}</p>` : ""}
        ${lineBtn()}
      </div>
    </article>`;
  }

  function coming() {
    return `<div class="coming"><p>商品陸續上架中，歡迎 LINE 詢問</p>${lineBtn("line-lg")}</div>`;
  }

  function parseQ(qs) {
    const o = {};
    new URLSearchParams(qs || "").forEach((v, k) => { o[k] = v; });
    return o;
  }
  function qsOf(o) {
    const u = new URLSearchParams();
    Object.entries(o).forEach(([k, v]) => { if (v) u.set(k, v); });
    const s = u.toString();
    return s ? "?" + s : "";
  }
  function currentQ() {
    return parseQ((location.hash.slice(1).split("?")[1]) || "");
  }
  function brandOf(id) { return BRANDS.find(b => b.id === id); }
  function typeOf(id) { return TYPES.find(t => t.id === id); }
  function modelName(brandId, modelId) {
    const b = brandOf(brandId);
    const m = b && b.models.find(x => x[0] === modelId);
    return m ? m[1] : "";
  }
  function matched(q) {
    const k = (q.q || "").trim().toLowerCase();
    return products.filter(p => {
      if (q.brand && p.brandId !== q.brand) return false;
      if (q.model && p.modelId !== q.model) return false;
      if (q.type && p.typeId !== q.type) return false;
      if (!k) return true;
      return (p.name + "\n" + p.brandText + "\n" + p.modelText + "\n" + p.categoryText).toLowerCase().includes(k);
    });
  }
  function productList(list) {
    if (loadState === "loading") return `<div class="coming"><p class="muted">載入中</p></div>`;
    if (!list.length) return coming();
    return `<div class="pgrid">${list.map(card).join("")}</div>`;
  }

  function bindImages(root) {
    if (!root) return;
    root.querySelectorAll(".pimg img").forEach(img => {
      img.addEventListener("error", () => {
        const ph = document.createElement("div");
        ph.className = "pimg-ph";
        const span = document.createElement("span");
        span.textContent = img.getAttribute("data-name") || "";
        ph.appendChild(span);
        img.replaceWith(ph);
      });
    });
  }

  function paintResults() {
    const el = $("#productResults");
    if (!el) return;
    el.innerHTML = productList(matched(currentQ()));
    bindImages(el);
  }

  function bindCatalog() {
    const input = $("#shopSearch");
    if (input) input.addEventListener("input", () => {
      const q = currentQ();
      q.q = input.value;
      const next = "#/shop" + qsOf(q);
      if (location.hash !== next) history.replaceState(null, "", next);
      paintResults();
    });
    const toggle = $(".filter-toggle");
    if (toggle) toggle.addEventListener("click", () => document.body.classList.toggle("filters-open"));
    bindImages(app);
  }

  function locationBlock() {
    return `<div class="loc"><div class="map"><iframe title="伊豆精品地圖" src="${esc(mapEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <div class="loc-info"><h3>${esc(S.name)}</h3><p class="muted">${esc(S.nameEn)}</p>
        <dl>
          <dt>地址</dt><dd><a href="${esc(mapSearch)}" target="_blank" rel="noopener noreferrer">${esc(S.address)}</a></dd>
          <dt>電話</dt><dd><a href="tel:${esc(S.tel)}">${esc(S.phone)}</a></dd>
          <dt>營業時間</dt><dd>${esc(S.hours)}</dd>
          <dt>Instagram</dt><dd><a href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">${esc(S.ig)}</a></dd>
        </dl>
        <div class="btns">${lineBtn()}<a class="btn ghost" href="tel:${esc(S.tel)}">撥打電話</a></div>
      </div></div>`;
  }

  function brandNav() {
    const count = id => products.filter(p => p.brandId === id).length;
    return `<section class="wrap sec"><div class="sec-h"><h2>依車廠選購</h2><a href="#/shop">全部商品 →</a></div>
      <div class="brand-grid">${BRANDS.map(b => `<a class="brand-tile" href="#/shop?brand=${encodeURIComponent(b.id)}" style="--bc:${b.color}"><b>${esc(b.name)}</b><span>${b.models.length} 款車型・${count(b.id)} 項商品</span></a>`).join("")}</div>
      <div class="type-strip">${TYPES.map(t => `<a href="#/shop?type=${encodeURIComponent(t.id)}">${esc(t.name)}</a>`).join("")}</div>
    </section>`;
  }

  function home() {
    return `<section class="hero"><div class="wrap hero-in">
        <div class="hero-txt"><span class="kicker">嘉義市西區</span>
          <h1>伊豆精品<br><em>EDO TUNING</em></h1>
          <p>${esc(S.intro)}</p>
          <div class="btns">${lineBtn()}<a class="btn ghost" href="#/shop">商品專區</a><a class="btn ghost" href="#/contact">聯絡我們</a></div>
        </div>
        <div class="hero-panel" aria-hidden="true"><b>伊豆精品</b><small>EDO TUNING</small></div>
      </div></section>
      ${brandNav()}
      <section class="wrap sec"><div class="sec-h"><h2>店家資訊</h2></div>${locationBlock()}</section>`;
  }

  function shop(q) {
    const b = q.brand && brandOf(q.brand);
    const t = q.type && typeOf(q.type);
    const mlabel = b && q.model ? modelName(q.brand, q.model) : "";
    const list = matched(q);
    const link = patch => esc("#/shop" + qsOf(Object.assign({}, q, patch)));
    const crumbs = [`<a href="#/shop">商品專區</a>`];
    if (b) crumbs.push(`<a href="${link({ model: "", type: "" })}">${esc(b.name)}</a>`);
    if (mlabel) crumbs.push(`<a href="${link({ type: "" })}">${esc(mlabel)}</a>`);
    if (t) crumbs.push(`<span>${esc(t.name)}</span>`);
    const title = t ? t.name : mlabel ? mlabel : b ? b.name + " 改裝精品" : "商品專區";
    const count = pred => products.filter(pred).length;
    const tags = [b && b.name, mlabel, t && t.name].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join("");
    return `<section class="page-h slim"><div class="wrap"><div class="crumbs">${crumbs.join(" › ")}</div><h1>${esc(title)}</h1>${list.length ? `<p>共 ${list.length} 項商品</p>` : ""}</div></section>
      <section class="wrap shop">
        <button class="btn ghost filter-toggle" type="button">篩選條件</button>
        <aside class="filters">
          <div class="fblock"><h4>車廠</h4><ul>${BRANDS.map(x => `<li><a class="${q.brand === x.id ? "on" : ""}" href="${link({ brand: q.brand === x.id ? "" : x.id, model: "" })}">${esc(x.name)}<span>${count(p => p.brandId === x.id)}</span></a>
            ${q.brand === x.id ? `<ul class="sub">${x.models.map(m => `<li><a class="${q.model === m[0] ? "on" : ""}" href="${link({ model: q.model === m[0] ? "" : m[0] })}">${esc(m[1])}<span>${count(p => p.brandId === x.id && p.modelId === m[0])}</span></a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul></div>
          <div class="fblock"><h4>商品類型</h4><ul>${TYPES.map(type => { const n = count(p => p.typeId === type.id && (!q.brand || p.brandId === q.brand) && (!q.model || p.modelId === q.model)); return `<li><a class="${q.type === type.id ? "on" : ""} ${n ? "" : "dim"}" href="${link({ type: q.type === type.id ? "" : type.id })}">${esc(type.name)}<span>${n}</span></a></li>`; }).join("")}</ul></div>
          <a class="btn ghost full" href="#/shop">清除全部條件</a>
        </aside>
        <div class="results">
          <div class="toolbar">
            <input id="shopSearch" type="search" value="${esc(q.q || "")}" placeholder="搜尋品名、品牌或車款" aria-label="搜尋品名、品牌或車款" autocomplete="off">
            <div class="active-tags">${tags}</div>
          </div>
          <div id="productResults">${productList(list)}</div>
        </div>
      </section>`;
  }

  function contact() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">聯絡我們</span><h1>聯絡我們</h1><p>${esc(S.address)}</p></div></section>
      <section class="wrap sec">${locationBlock()}</section>`;
  }

  function route(opts) {
    const h = location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    const seg = path.split("/").filter(Boolean);
    const q = parseQ(qs);
    let html;
    switch (seg[0]) {
      case undefined: html = home(); break;
      case "shop": html = shop(q); break;
      case "contact": html = contact(); break;
      default: html = home();
    }
    app.innerHTML = html;
    document.body.classList.remove("nav-open", "filters-open");
    const cur = seg[0] === "shop" || seg[0] === "contact" ? seg[0] : "";
    document.querySelectorAll("#nav a").forEach(a => {
      const href = a.getAttribute("href");
      a.classList.toggle("active", href === (cur ? "#/" + cur : "#/"));
    });
    bindCatalog();
    if (!opts || !opts.keepScroll) window.scrollTo(0, 0);
  }

  async function loadSheet() {
    try {
      const res = await fetch(sheetCsvUrl(), { cache: "no-store" });
      if (!res.ok) throw new Error("sheet");
      const text = await res.text();
      if (!text || /^\s*</.test(text)) throw new Error("sheet");
      const rows = productsFromCsv(text);
      placeProducts(rows);
      loadState = products.length ? "ready" : "empty";
    } catch (e) {
      resetTaxonomy();
      products = [];
      window.PRODUCTS = products;
      loadState = "empty";
    }
    route({ keepScroll: true });
  }

  document.querySelectorAll("[data-line]").forEach(a => { a.href = LINE_URL; });
  $("#hdrSearch").addEventListener("submit", e => {
    e.preventDefault();
    const value = new FormData(e.target).get("q");
    const q = currentQ();
    q.q = String(value || "").trim();
    if (!location.hash.startsWith("#/shop")) { q.brand = ""; q.model = ""; q.type = ""; }
    location.hash = "#/shop" + qsOf(q);
  });
  $("#footInfo").innerHTML = `<a href="${esc(mapSearch)}" target="_blank" rel="noopener noreferrer">${esc(S.address)}</a><br>電話 <a href="tel:${esc(S.tel)}">${esc(S.phone)}</a><br>${esc(S.hours)}<br><a href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${esc(S.ig)}</a>`;
  $("#nav").addEventListener("click", e => { if (e.target.closest("a")) document.body.classList.remove("nav-open"); });
  window.addEventListener("hashchange", () => route());
  route();
  loadSheet();
})();
