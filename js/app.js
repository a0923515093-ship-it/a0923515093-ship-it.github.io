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

  let products = [];
  let loadState = "loading";
  let query = "";
  let cat = "";

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
      p.brand ? `<p class="pmeta"><span>品牌</span> ${esc(p.brand)}</p>` : "",
      p.model ? `<p class="pmeta"><span>適用車款</span> ${esc(p.model)}</p>` : "",
      p.category ? `<p class="pmeta"><span>類別</span> ${esc(p.category)}</p>` : ""
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

  function unique(list) {
    const out = [];
    list.forEach(v => { if (v && out.indexOf(v) < 0) out.push(v); });
    return out;
  }

  function visibleProducts() {
    const q = query.trim().toLowerCase();
    return products.filter(p => {
      if (cat && p.category !== cat) return false;
      if (!q) return true;
      return (p.name + "\n" + p.brand + "\n" + p.model).toLowerCase().includes(q);
    });
  }

  function productList(list) {
    if (!list.length) return `<div class="empty"><p>沒有符合的商品，歡迎 LINE 詢問</p>${lineBtn()}</div>`;
    return `<div class="pgrid">${list.map(card).join("")}</div>`;
  }

  function catalog() {
    const cats = unique(products.map(p => p.category));
    const chips = cats.length ? `<div class="chips" role="group" aria-label="類別">${["", ...cats].map(c => `<button type="button" class="chip${c === cat ? " on" : ""}" data-cat="${esc(c)}">${esc(c || "全部")}</button>`).join("")}</div>` : "";
    return `<div class="catalog">
      <div class="catalog-bar">
        <input id="productSearch" type="search" value="${esc(query)}" placeholder="搜尋品名、品牌或車款" aria-label="搜尋品名、品牌或車款" autocomplete="off">
        ${chips}
      </div>
      <div id="productResults">${productList(visibleProducts())}</div>
    </div>`;
  }

  function productBody() {
    if (loadState === "loading") return `<div class="coming"><p class="muted">載入中</p></div>`;
    if (loadState !== "ready") return coming();
    return catalog();
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
    el.innerHTML = productList(visibleProducts());
    bindImages(el);
  }

  function bindCatalog() {
    const input = $("#productSearch");
    if (input) input.addEventListener("input", () => { query = input.value; paintResults(); });
    document.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        cat = btn.getAttribute("data-cat") || "";
        document.querySelectorAll(".chip").forEach(b => b.classList.toggle("on", (b.getAttribute("data-cat") || "") === cat));
        paintResults();
      });
    });
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

  function home() {
    return `<section class="hero"><div class="wrap hero-in">
        <div class="hero-txt"><span class="kicker">嘉義市西區</span>
          <h1>伊豆精品<br><em>EDO TUNING</em></h1>
          <p>${esc(S.intro)}</p>
          <div class="btns">${lineBtn()}<a class="btn ghost" href="#/contact">聯絡我們</a></div>
        </div>
        <div class="hero-panel" aria-hidden="true"><b>伊豆精品</b><small>EDO TUNING</small></div>
      </div></section>
      <section class="wrap sec"><div class="sec-h"><h2>店家資訊</h2></div>${locationBlock()}</section>
      <section class="wrap sec"><div class="sec-h"><h2>商品</h2></div>${productBody()}</section>`;
  }

  function shop() {
    return `<section class="page-h slim"><div class="wrap"><h1>商品</h1></div></section>
      <section class="wrap sec">${productBody()}</section>`;
  }

  function contact() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">聯絡我們</span><h1>聯絡我們</h1><p>${esc(S.address)}</p></div></section>
      <section class="wrap sec">${locationBlock()}</section>`;
  }

  function route(opts) {
    const h = location.hash.slice(1) || "/";
    const path = h.split("?")[0];
    const seg = path.split("/").filter(Boolean);
    let html;
    switch (seg[0]) {
      case undefined: html = home(); break;
      case "shop": html = shop(); break;
      case "contact": html = contact(); break;
      default: html = home();
    }
    app.innerHTML = html;
    document.body.classList.remove("nav-open");
    const cur = seg[0] === "shop" || seg[0] === "contact" ? seg[0] : "";
    document.querySelectorAll("#nav a").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === (cur ? "#/" + cur : "#/"));
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
      products = productsFromCsv(text);
      loadState = products.length ? "ready" : "empty";
    } catch (e) {
      products = [];
      loadState = "empty";
    }
    window.PRODUCTS = products;
    route({ keepScroll: true });
  }

  document.querySelectorAll("[data-line]").forEach(a => { a.href = LINE_URL; });
  $("#footInfo").innerHTML = `<a href="${esc(mapSearch)}" target="_blank" rel="noopener noreferrer">${esc(S.address)}</a><br>電話 <a href="tel:${esc(S.tel)}">${esc(S.phone)}</a><br>${esc(S.hours)}<br><a href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${esc(S.ig)}</a>`;
  $("#nav").addEventListener("click", e => { if (e.target.closest("a")) document.body.classList.remove("nav-open"); });
  window.addEventListener("hashchange", () => route());
  route();
  loadSheet();
})();
