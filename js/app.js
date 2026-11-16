function priceLabel(v) {
  if (v == null || v === "") return "";
  if (typeof v === "number" && isFinite(v)) return "NT$ " + v.toLocaleString("zh-TW");
  const s = String(v).trim();
  if (!s) return "";
  if (/^NT\$/i.test(s)) return s.replace(/^nt\$/i, "NT$");
  const n = Number(String(s).replace(/,/g, ""));
  if (String(s).replace(/,/g, "") !== "" && isFinite(n)) return "NT$ " + n.toLocaleString("zh-TW");
  return "NT$" + s;
}

(function () {
  const $ = s => document.querySelector(s);
  const app = $("#app");
  let S = Object.assign({
    lineUrl: "https://line.me/",
    heroTitle: "讓每一台車",
    heroHighlight: "更快、更好開、更像你",
    heroSubtitle: "依「車廠 → 車型 → 商品類型」瀏覽撥片、排氣、懸吊、輪圈、煞車與電腦調校。嘉義汽車改裝精品，商品與安裝歡迎 LINE 詢問。",
    aboutText: "嘉義汽車改裝精品，商品與安裝歡迎 LINE 詢問。"
  }, window.STORE);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mapSearch = () => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.address);
  const mapEmbed = () => "https://www.google.com/maps?q=" + encodeURIComponent(S.address) + "&hl=zh-TW&z=16&output=embed";
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
    products = [];
    (Array.isArray(rows) ? rows : []).forEach((row, i) => {
      if (!row || row.published === false) return;
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
      const images = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
      products.push({
        id: String(row.id || ("p" + (i + 1))),
        name: row.name || "",
        price: row.price == null || row.price === "" ? "" : row.price,
        note: typeof row.description === "string" ? row.description : "",
        photo: images[0] || "",
        images,
        featured: !!row.featured,
        brandText: brand ? brand.name : (row.brand || ""),
        modelText: model ? model[1] : (row.model || ""),
        categoryText: type ? type.name : (row.category || ""),
        brandId: brand ? brand.id : "",
        modelId: model ? model[0] : "",
        typeId: type ? type.id : ""
      });
    });
    window.PRODUCTS = products;
  }

  function lineBtn(extra) {
    return `<a class="btn line${extra ? " " + extra : ""}" href="${esc(S.lineUrl)}" target="_blank" rel="noopener noreferrer">LINE 詢問</a>`;
  }

  function media(p) {
    if (!p.photo) return `<div class="pimg-ph"><span>${esc(p.name)}</span></div>`;
    return `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" data-name="${esc(p.name)}">`;
  }

  function card(p) {
    const href = "#/product/" + encodeURIComponent(p.id);
    const meta = [
      p.brandText ? `<p class="pmeta"><span>品牌</span> ${esc(p.brandText)}</p>` : "",
      p.modelText ? `<p class="pmeta"><span>適用車款</span> ${esc(p.modelText)}</p>` : "",
      p.categoryText ? `<p class="pmeta"><span>類別</span> ${esc(p.categoryText)}</p>` : ""
    ].join("");
    const price = priceLabel(p.price);
    return `<article class="pcard">
      <a class="pimg" href="${href}">${media(p)}</a>
      <div class="pbody">
        <h3><a href="${href}">${esc(p.name)}</a></h3>
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
    root.querySelectorAll(".pimg img, .gallery img").forEach(img => {
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
    document.querySelectorAll(".thumbs img").forEach(img => {
      img.addEventListener("click", () => {
        const main = document.getElementById("mainImg");
        if (main) main.src = img.getAttribute("data-full") || img.src;
      });
    });
    bindImages(app);
  }

  function locationBlock() {
    return `<div class="loc"><div class="map"><iframe title="伊豆精品地圖" src="${esc(mapEmbed())}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <div class="loc-info"><h3>${esc(S.name)}</h3><p class="muted">${esc(S.nameEn)}</p>
        <dl>
          <dt>地址</dt><dd><a href="${esc(mapSearch())}" target="_blank" rel="noopener noreferrer">${esc(S.address)}</a></dd>
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

  const CASE_SLOTS = 6;

  function iconSvg(type) {
    const paths = {
      paddle: '<path d="M18 34a16 16 0 1 0 32 0 16 16 0 1 0-32 0" fill="none" stroke="#ff3b30" stroke-width="3"/><path d="M28 34h12M34 34v10" stroke="#ff3b30" stroke-width="3" stroke-linecap="round"/>',
      exhaust: '<path d="M8 36h28" fill="none" stroke="#ff3b30" stroke-width="4" stroke-linecap="round"/><ellipse cx="48" cy="36" rx="8" ry="10" fill="none" stroke="#ff3b30" stroke-width="3"/>',
      suspension: '<path d="M34 8v10M34 50v10M24 18h20M24 50h20" stroke="#ff3b30" stroke-width="3"/><path d="M26 22l16 4-16 4 16 4-16 4 16 4" fill="none" stroke="#ff3b30" stroke-width="2"/>',
      wheel: '<circle cx="34" cy="34" r="18" fill="none" stroke="#ff3b30" stroke-width="3"/><circle cx="34" cy="34" r="4" fill="#ff3b30"/>',
      brake: '<circle cx="34" cy="34" r="16" fill="none" stroke="#ff3b30" stroke-width="3"/><path d="M18 18c-6 10-6 22 0 32" fill="none" stroke="#ff3b30" stroke-width="4"/>',
      intake: '<path d="M12 22h24l10-8v36l-10-8H12z" fill="none" stroke="#ff3b30" stroke-width="3"/>',
      aero: '<path d="M8 42c10-16 28-16 40-4" fill="none" stroke="#ff3b30" stroke-width="3"/><circle cx="20" cy="44" r="4" fill="#ff3b30"/><circle cx="46" cy="44" r="4" fill="#ff3b30"/>',
      interior: '<path d="M22 52l4-24c1-6 6-8 12-8s11 2 12 8l4 24" fill="none" stroke="#ff3b30" stroke-width="3"/>',
      tuning: '<rect x="16" y="16" width="36" height="28" rx="3" fill="none" stroke="#ff3b30" stroke-width="3"/><path d="M22 36l8-8 6 5 10-12" fill="none" stroke="#ff3b30" stroke-width="3"/>'
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68"><rect width="68" height="68" rx="10" fill="#15171c"/>${paths[type] || paths.tuning}</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function caseCard() {
    return `<article class="case"><div class="case-ph">內容準備中</div><div><b>施工案例</b><p>施工案例陸續更新，歡迎追蹤 <a class="ig-link" href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">IG ${esc(S.ig)}</a></p></div></article>`;
  }

  function home() {
    const featured = (products.some(p => p.featured) ? products.filter(p => p.featured) : products).slice(0, 8);
    const featuredBody = loadState === "loading"
      ? `<div class="coming"><p class="muted">載入中</p></div>`
      : featured.length ? `<div class="pgrid">${featured.map(card).join("")}</div>` : coming();
    return `<section class="hero"><div class="wrap hero-in">
        <div class="hero-txt"><span class="kicker">嘉義市西區</span>
          <h1>${esc(S.heroTitle || "")}<br><em>${esc(S.heroHighlight || "")}</em></h1>
          <p>${esc(S.heroSubtitle || S.intro || "")}</p>
          <div class="btns"><a class="btn primary" href="#/shop">進入商品專區 →</a><a class="btn ghost" href="#/services">施工項目</a><a class="btn ghost" href="#/contact">我們在哪裡</a></div>
          <div class="hero-stats"><div><b>內容準備中</b><span>精選商品</span></div><div><b>內容準備中</b><span>施工案例</span></div><div><b>嘉義市西區</b><span>到店洽詢</span></div></div>
        </div>
        <div class="hero-panel" aria-hidden="true"><b>伊豆精品</b><small>EDO TUNING</small></div>
      </div></section>
      ${brandNav()}
      <section class="wrap sec"><div class="sec-h"><h2>熱銷精選</h2><a href="#/shop">看更多 →</a></div>${featuredBody}</section>
      <section class="band"><div class="wrap sec two">
        <div><span class="kicker">關於伊豆精品</span><h2>嘉義在地的改裝夥伴</h2>
          <p>${esc(S.intro)}</p>
          <a class="btn ghost" href="#/about">認識伊豆精品 →</a></div>
        <div class="svc-mini">${TYPES.slice(0, 6).map(t => `<a href="#/services"><img class="svc-ic" src="${iconSvg(t.id)}" alt=""><b>${esc(t.name)}</b></a>`).join("")}</div>
      </div></section>
      <section class="wrap sec"><div class="sec-h"><h2>施工案例</h2><a href="#/cases">全部案例 →</a></div>
        <div class="case-grid">${Array.from({ length: 3 }, caseCard).join("")}</div></section>
      <section class="wrap sec"><div class="sec-h"><h2>我們在哪裡</h2><a href="${esc(mapSearch())}" target="_blank" rel="noopener noreferrer">Google 地圖 →</a></div>
        ${locationBlock()}</section>`;
  }

  function about() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">關於我們</span><h1>關於伊豆精品</h1><p>嘉義市西區・汽車改裝精品</p></div></section>
      <section class="wrap sec two">
        <div><h2>我們的理念</h2><p>${esc(S.aboutText || S.intro || "")}</p><p class="muted">內容準備中</p></div>
        <div class="about-cards">
          <div><b>車廠與車型</b><span>內容準備中</span></div>
          <div><b>到店洽詢</b><span>歡迎先用 LINE 或電話預約。</span></div>
          <div><b>安裝方式</b><span>內容準備中</span></div>
          <div><b>售後說明</b><span>內容準備中</span></div>
        </div>
      </section>
      <section class="wrap sec"><div class="sec-h"><h2>店家位置</h2></div>${locationBlock()}</section>`;
  }

  function services() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">施工項目</span><h1>我們能幫你的車做什麼</h1><p>項目內容歡迎先用電話、LINE 或 IG 詢問。</p></div></section>
      <section class="wrap sec">
        <div class="svc-grid">${TYPES.map(t => `<div class="svc"><img class="svc-ic" src="${iconSvg(t.id)}" alt=""><h3>${esc(t.name)}</h3><p>內容準備中</p></div>`).join("")}</div>
        <div class="flow"><h2>施工流程</h2><ol>
          <li><b>諮詢</b>來電、LINE 或 IG 說明車型與需求</li>
          <li><b>報價</b>確認項目</li>
          <li><b>預約</b>安排時間</li>
          <li><b>施工</b>到店進行</li>
          <li><b>交車</b>說明後續事項</li>
        </ol></div>
        <div class="cta"><div><h3>想先看商品？</h3><p>到商品專區依車廠、車型與類型瀏覽。</p></div><a class="btn primary" href="#/shop">前往商品專區 →</a></div>
      </section>`;
  }

  function cases() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">施工案例</span><h1>作品集</h1><p>施工案例陸續更新，歡迎追蹤 IG ${esc(S.ig)}</p></div></section>
      <section class="wrap sec"><div class="case-grid">${Array.from({ length: CASE_SLOTS }, caseCard).join("")}</div></section>`;
  }

  function gallery(p) {
    const imgs = p.images && p.images.length ? p.images : (p.photo ? [p.photo] : []);
    if (!imgs.length) return `<div class="case-ph">${esc(p.name)}</div>`;
    const thumbs = imgs.length > 1 ? `<div class="thumbs">${imgs.map(src => `<img src="${esc(src)}" alt="" data-full="${esc(src)}">`).join("")}</div>` : "";
    return `<img id="mainImg" src="${esc(imgs[0])}" alt="${esc(p.name)}" data-name="${esc(p.name)}">${thumbs}`;
  }

  function productPage(id) {
    const p = products.find(x => x.id === id);
    if (!p) return `<section class="page-h slim"><div class="wrap"><h1>商品</h1></div></section><section class="wrap sec">${coming()}</section>`;
    const rel = products.filter(x => x.id !== p.id && ((p.brandId && x.brandId === p.brandId) || (p.typeId && x.typeId === p.typeId))).slice(0, 4);
    const price = priceLabel(p.price);
    const rows = [["品牌", p.brandText], ["適用車款", p.modelText], ["類別", p.categoryText], ["價格", price]].filter(x => x[1]);
    const crumbs = [`<a href="#/shop">商品專區</a>`];
    if (p.brandId) crumbs.push(`<a href="#/shop?brand=${encodeURIComponent(p.brandId)}">${esc(p.brandText)}</a>`);
    if (p.modelId) crumbs.push(`<a href="#/shop?brand=${encodeURIComponent(p.brandId)}&model=${encodeURIComponent(p.modelId)}">${esc(p.modelText)}</a>`);
    if (p.typeId) crumbs.push(`<a href="#/shop?type=${encodeURIComponent(p.typeId)}">${esc(p.categoryText)}</a>`);
    return `<section class="wrap sec"><div class="crumbs">${crumbs.join(" › ")}</div>
      <div class="pd">
        <div class="gallery">${gallery(p)}</div>
        <div class="pd-info">
          <h1>${esc(p.name)}</h1>
          ${price ? `<div class="pd-price"><b>${esc(price)}</b></div>` : ""}
          ${p.note ? `<p class="pdesc">${esc(p.note)}</p>` : `<p class="muted">內容準備中</p>`}
          <div class="btns">${lineBtn()}</div>
        </div>
      </div>
      ${rows.length ? `<div class="pd-tabs"><h3>商品資料</h3><table class="spec">${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table></div>` : ""}
      <div class="sec-h"><h2>你可能也喜歡</h2></div>
      ${rel.length ? `<div class="pgrid">${rel.map(card).join("")}</div>` : `<div class="coming"><p>內容準備中</p>${lineBtn("line-lg")}</div>`}
    </section>`;
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
    return `<section class="page-h"><div class="wrap"><span class="kicker">聯絡我們</span><h1>交通資訊與地圖</h1><p>${esc(S.address)}</p></div></section>
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
      case "about": html = about(); break;
      case "services": html = services(); break;
      case "shop": html = shop(q); break;
      case "cases": html = cases(); break;
      case "contact": html = contact(); break;
      case "product": {
        let pid = seg[1] || "";
        try { pid = decodeURIComponent(pid); } catch (e) {}
        html = productPage(pid);
        break;
      }
      default: html = home();
    }
    app.innerHTML = html;
    document.body.classList.remove("nav-open", "filters-open");
    const page = seg[0] === "product" ? "shop" : (seg[0] || "");
    document.querySelectorAll("#nav a").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === (page ? "#/" + page : "#/"));
    });
    bindCatalog();
    if (!opts || !opts.keepScroll) window.scrollTo(0, 0);
  }

  function applyChrome() {
    document.querySelectorAll("[data-line]").forEach(a => { a.href = S.lineUrl; });
    const search = mapSearch();
    $("#footInfo").innerHTML = `<a href="${esc(search)}" target="_blank" rel="noopener noreferrer">${esc(S.address)}</a><br>電話 <a href="tel:${esc(S.tel)}">${esc(S.phone)}</a><br>${esc(S.hours)}<br><a href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${esc(S.ig)}</a>`;
  }

  async function loadContent() {
    try {
      const res = await fetch("content/site.json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object" && !Array.isArray(data)) S = Object.assign({}, S, data);
      }
    } catch (e) {}
    try {
      const res = await fetch("content/products.json", { cache: "no-store" });
      if (!res.ok) throw new Error("products");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("products");
      placeProducts(data);
      loadState = products.length ? "ready" : "empty";
    } catch (e) {
      resetTaxonomy();
      products = [];
      window.PRODUCTS = products;
      loadState = "empty";
    }
    applyChrome();
    route({ keepScroll: true });
  }

  $("#hdrSearch").addEventListener("submit", e => {
    e.preventDefault();
    const value = new FormData(e.target).get("q");
    const q = currentQ();
    q.q = String(value || "").trim();
    if (!location.hash.startsWith("#/shop")) { q.brand = ""; q.model = ""; q.type = ""; }
    location.hash = "#/shop" + qsOf(q);
  });
  applyChrome();
  $("#nav").addEventListener("click", e => { if (e.target.closest("a")) document.body.classList.remove("nav-open"); });
  window.addEventListener("hashchange", () => route());
  route();
  loadContent();
})();
