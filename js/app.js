(function () {
  const $ = s => document.querySelector(s);
  const app = $("#app");
  const S = window.STORE;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mapSearch = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.address);
  const mapEmbed = "https://www.google.com/maps?q=" + encodeURIComponent(S.address) + "&hl=zh-TW&z=16&output=embed";

  function lineBtn(extra) {
    return `<a class="btn line${extra ? " " + extra : ""}" href="${esc(LINE_URL)}" target="_blank" rel="noopener noreferrer">LINE 詢問</a>`;
  }

  /* 商品卡片。PRODUCTS 為空時不渲染。按鈕連到 LINE_URL。 */
  function card(p) {
    const tags = [p.brand, p.type].filter(Boolean).map(esc).join(" · ");
    const media = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.name || "")}" loading="lazy">`
      : `<div class="pimg-ph" aria-hidden="true"></div>`;
    return `<article class="pcard">
      <div class="pimg">${media}</div>
      <div class="pbody">${tags ? `<div class="ptag">${tags}</div>` : ""}<h3>${esc(p.name || "")}</h3>${lineBtn()}</div>
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

  /* 沒有商品，或商品都沒有車廠／類型時，不渲染篩選。 */
  function filtersHtml(q) {
    const brands = unique(PRODUCTS.map(p => p.brand));
    const types = unique(PRODUCTS.map(p => p.type));
    if (!brands.length && !types.length) return "";
    const link = patch => esc("#/shop" + qsOf(Object.assign({}, q, patch)));
    const count = (key, val) => PRODUCTS.filter(p => p[key] === val).length;
    const block = (title, key, values, current) => values.length ? `<div class="fblock"><h4>${title}</h4><ul>${values.map(v => `<li><a class="${current === v ? "on" : ""}" href="${link({ [key]: current === v ? "" : v })}">${esc(v)}<span>${count(key, v)}</span></a></li>`).join("")}</ul></div>` : "";
    return `<button class="btn ghost filter-toggle" type="button" onclick="document.body.classList.toggle('filters-open')">篩選</button>
      <aside class="filters">${block("車廠", "brand", brands, q.brand)}${block("類型", "type", types, q.type)}<a class="btn ghost full" href="#/shop">清除條件</a></aside>`;
  }

  function productList(list) {
    if (!list.length) return `<div class="empty"><p>沒有符合的商品，歡迎 LINE 詢問</p>${lineBtn()}</div>`;
    return `<div class="pgrid">${list.map(card).join("")}</div>`;
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
    const products = PRODUCTS.length
      ? `<section class="wrap sec"><div class="sec-h"><h2>商品</h2><a href="#/shop">全部商品</a></div><div class="pgrid">${PRODUCTS.slice(0, 8).map(card).join("")}</div></section>`
      : `<section class="wrap sec"><div class="sec-h"><h2>商品</h2></div>${coming()}</section>`;
    return `<section class="hero"><div class="wrap hero-in">
        <div class="hero-txt"><span class="kicker">嘉義市西區</span>
          <h1>伊豆精品<br><em>EDO TUNING</em></h1>
          <p>${esc(S.intro)}</p>
          <div class="btns">${lineBtn()}<a class="btn ghost" href="#/contact">聯絡我們</a></div>
        </div>
        <div class="hero-panel" aria-hidden="true"><b>伊豆精品</b><small>EDO TUNING</small></div>
      </div></section>
      <section class="wrap sec"><div class="sec-h"><h2>店家資訊</h2></div>${locationBlock()}</section>
      ${products}`;
  }

  function shop(q) {
    if (!PRODUCTS.length) {
      return `<section class="page-h"><div class="wrap"><span class="kicker">商品</span><h1>商品</h1></div></section>
        <section class="wrap sec">${coming()}</section>`;
    }
    let list = PRODUCTS.slice();
    if (q.brand) list = list.filter(p => p.brand === q.brand);
    if (q.type) list = list.filter(p => p.type === q.type);
    const filters = filtersHtml(q);
    const title = q.type || q.brand || "商品";
    return `<section class="page-h slim"><div class="wrap"><h1>${esc(title)}</h1></div></section>
      <section class="wrap shop${filters ? "" : " shop-plain"}">${filters}<div class="results">${productList(list)}</div></section>`;
  }

  function contact() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">聯絡我們</span><h1>聯絡我們</h1><p>${esc(S.address)}</p></div></section>
      <section class="wrap sec">${locationBlock()}</section>`;
  }

  function route() {
    const h = location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    const seg = path.split("/").filter(Boolean);
    let html;
    switch (seg[0]) {
      case undefined: html = home(); break;
      case "shop": html = shop(parseQ(qs)); break;
      case "contact": html = contact(); break;
      default: html = home();
    }
    app.innerHTML = html;
    document.body.classList.remove("nav-open", "filters-open");
    const cur = seg[0] === "shop" || seg[0] === "contact" ? seg[0] : "";
    document.querySelectorAll("#nav a").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === (cur ? "#/" + cur : "#/"));
    });
    window.scrollTo(0, 0);
  }

  document.querySelectorAll("[data-line]").forEach(a => { a.href = LINE_URL; });
  $("#footInfo").innerHTML = `<a href="${esc(mapSearch)}" target="_blank" rel="noopener noreferrer">${esc(S.address)}</a><br>電話 <a href="tel:${esc(S.tel)}">${esc(S.phone)}</a><br>${esc(S.hours)}<br><a href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${esc(S.ig)}</a>`;
  $("#nav").addEventListener("click", e => { if (e.target.closest("a")) document.body.classList.remove("nav-open"); });
  window.addEventListener("hashchange", route);
  route();
})();
