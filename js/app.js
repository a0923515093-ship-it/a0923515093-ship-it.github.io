(function () {
  const $ = s => document.querySelector(s);
  const app = $("#app");
  const S = window.STORE;
  const brandOf = id => BRANDS.find(b => b.id === id);
  const typeOf = id => TYPES.find(t => t.id === id);
  const modelName = (b, m) => { const br = brandOf(b); const x = br && br.models.find(z => z[0] === m); return x ? x[1] : ""; };
  const money = n => "NT$ " + n.toLocaleString("zh-TW");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PER = 12;

  /* ---------- 購物車（localStorage） ---------- */
  const cart = {
    get() { try { return JSON.parse(localStorage.getItem("izu_cart") || "[]"); } catch (e) { return []; } },
    set(c) { localStorage.setItem("izu_cart", JSON.stringify(c)); updateCount(); },
    add(id, q) { const c = this.get(); const i = c.find(x => x.id === id); i ? i.q += q : c.push({ id, q }); this.set(c); },
  };
  function updateCount() { $("#cartCount").textContent = cart.get().reduce((a, b) => a + b.q, 0); }
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 1800); }

  const img = (p, v) => svgImg(typeOf(p.type).icon, `${brandOf(p.brand).name} · ${typeOf(p.type).name}`, brandOf(p.brand).color === "#a8b0b8" ? "#ff3b30" : "#ff3b30", v || 0);

  function card(p) {
    return `<a class="pcard" href="#/product/${p.id}">
      <div class="pimg"><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy">${p.hot ? '<span class="badge hot">熱銷</span>' : ""}${p.orig ? '<span class="badge sale">優惠</span>' : ""}<span class="badge sample">範例</span></div>
      <div class="pbody"><div class="ptag">${brandOf(p.brand).name} · ${modelName(p.brand, p.model)}</div>
      <h3>${esc(p.name)}</h3>
      <div class="pprice"><b>${money(p.price)}</b>${p.orig ? `<s>${money(p.orig)}</s>` : ""}</div>
      <div class="pmeta">${typeOf(p.type).name}・${p.stock ? '<span class="ok">現貨</span>' : '<span class="warn">預購</span>'}</div></div></a>`;
  }
  const svcIcon = t => `<img class="svc-ic" src="${svgImg(t, "", "#ff3b30", 0)}" alt="">`;

  /* ---------- 頁面 ---------- */
  function home() {
    const featured = PRODUCTS.filter(p => p.hot).slice(0, 8);
    return `
    <section class="hero"><div class="wrap hero-in">
      <div class="hero-txt"><span class="kicker">嘉義市西區・性能改裝工作室</span>
        <h1>讓每一台車<br><em>更快、更好開、更像你</em></h1>
        <p>伊豆精品提供撥片、排氣、懸吊、輪圈、煞車到 ECU 調校的一站式改裝。上千項精品依「車廠 → 車型 → 商品類型」分類，線上選購、到店施工。</p>
        <div class="btns"><a class="btn primary" href="#/shop">進入商品專區 →</a><a class="btn ghost" href="#/services">施工項目</a><a class="btn ghost" href="#/contact">📍 到店地圖</a></div>
        <div class="hero-stats"><div><b>1000+</b><span>改裝精品（規劃）</span></div><div><b>10+</b><span>支援車廠</span></div><div><b>到店施工</b><span>嘉義市西區</span></div></div>
      </div>
      <div class="hero-art"><img src="${svgImg("wheel", "", "#ff3b30", 0)}" alt=""></div>
    </div></section>

    <section class="wrap sec"><div class="sec-h"><h2>依車廠選購</h2><a href="#/shop">全部商品 →</a></div>
      <div class="brand-grid">${BRANDS.map(b => `<a class="brand-tile" href="#/shop?brand=${b.id}" style="--bc:${b.color}"><b>${b.name}</b><span>${b.models.length} 款車型・${PRODUCTS.filter(p => p.brand === b.id).length} 項商品</span></a>`).join("")}</div>
      <div class="type-strip">${TYPES.map(t => `<a href="#/shop?type=${t.id}">${t.name}</a>`).join("")}</div>
    </section>

    <section class="wrap sec"><div class="sec-h"><h2>熱銷精選</h2><a href="#/shop?sort=hot">看更多 →</a></div>
      <div class="pgrid">${featured.map(card).join("")}</div></section>

    <section class="band"><div class="wrap sec two">
      <div><span class="kicker">關於伊豆精品</span><h2>嘉義在地的改裝夥伴</h2>
        <p>伊豆精品位於嘉義市西區，專注歐系與日系性能車改裝。從一組撥片到整車動力升級，我們都會先了解你的用車習慣，再建議最適合的方案，並在店內完成施工與調整。</p>
        <a class="btn ghost" href="#/about">認識伊豆精品 →</a></div>
      <div class="svc-mini">${SERVICES.slice(0, 6).map(s => `<a href="#/services">${svcIcon(s.icon)}<b>${s.t}</b></a>`).join("")}</div>
    </div></section>

    <section class="wrap sec"><div class="sec-h"><h2>施工案例</h2><a href="#/cases">全部案例 →</a></div>
      <div class="case-grid">${CASES.slice(0, 3).map(caseCard).join("")}</div></section>

    <section class="wrap sec"><div class="sec-h"><h2>我們在哪裡</h2><a href="${S.mapNav}" target="_blank" rel="noopener">Google 導航 →</a></div>
      ${locationBlock()}</section>`;
  }

  function locationBlock() {
    return `<div class="loc"><div class="map"><iframe title="伊豆精品地圖" src="${S.mapEmbed}" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <div class="loc-info"><h3>伊豆精品</h3>
        <dl><dt>地址</dt><dd>${S.address}</dd><dt>電話</dt><dd><a href="tel:${S.tel}">${S.phone}</a></dd><dt>營業時間</dt><dd>${S.hours}</dd><dt>Instagram</dt><dd><a class="ig-link" href="${S.instagram}" target="_blank" rel="noopener">${S.ig}</a></dd></dl>
        <div class="btns"><a class="btn primary" href="${S.mapNav}" target="_blank" rel="noopener">📍 Google 導航</a><a class="btn ghost" href="tel:${S.tel}">📞 撥打電話</a><a class="btn ghost" href="${S.instagram}" target="_blank" rel="noopener">IG ${S.ig}</a></div>
        <p class="muted small">施工建議先來電預約，以便安排工位與備料。</p></div></div>`;
  }

  function caseCard(c, i) {
    const b = brandOf(c.brand);
    return `<div class="case"><img src="${svgImg(["paddle","tuning","wheel","aero","intake","suspension","exhaust","intake","paddle"][CASES.indexOf(c)] || "aero", "施工案例・範例照片", b.color, CASES.indexOf(c) % 4)}" alt=""><div><b>${c.t}</b><div class="tags">${c.tags.map(t => `<span>${t}</span>`).join("")}</div></div></div>`;
  }

  function about() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">關於伊豆精品</span><h1>伊豆精品</h1><p>嘉義市西區・性能改裝與精品販售</p></div></section>
    <section class="wrap sec two">
      <div><h2>我們的理念</h2><p>改裝不是把零件裝上去就好。伊豆精品從車主的用車情境出發，日常通勤、山路或賽道，給出合適又合法的建議，並在店內完成安裝、調整與售後。</p>
      <p>我們代理與銷售各式改裝精品，依車廠、車型分類管理，讓你在網站上就能找到自己車子適用的零件。</p>
      <p class="muted small">（此段為範例文案，正式上線時可替換為伊豆精品的真實故事、成立年份與團隊介紹。）</p></div>
      <div class="about-cards"><div><b>原車適配</b><span>依車型確認相容性再出貨／施工</span></div><div><b>到店施工</b><span>專業工位與設備，施工後試車確認</span></div><div><b>售後保固</b><span>商品依原廠保固，施工問題回店處理</span></div><div><b>線上選購</b><span>上千項商品分類清楚，可線上付款</span></div></div>
    </section>
    <section class="wrap sec"><div class="sec-h"><h2>店家位置</h2></div>${locationBlock()}</section>`;
  }

  function services() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">施工項目</span><h1>我們能幫你的車做什麼</h1><p>所有施工皆可先來電或私訊 IG 預約・價格依車型與零件報價</p></div></section>
    <section class="wrap sec"><div class="svc-grid">${SERVICES.map(s => `<div class="svc">${svcIcon(s.icon)}<h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}</div>
    <div class="flow"><h2>施工流程</h2><ol><li><b>諮詢</b>來電 / IG 說明車型與需求</li><li><b>報價</b>確認零件相容性與工時</li><li><b>預約</b>安排工位與備料</li><li><b>施工</b>到店安裝、調整、試車</li><li><b>交車</b>說明保固與保養建議</li></ol></div>
    <div class="cta"><div><h3>想先看零件？</h3><p>到商品專區依車廠、車型找到適用你愛車的改裝精品。</p></div><a class="btn primary" href="#/shop">前往商品專區 →</a></div></section>`;
  }

  function cases() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">施工案例</span><h1>作品集</h1><p>以下照片為範例示意，正式上線時替換為實際施工照片（可串接 IG）</p></div></section>
    <section class="wrap sec"><div class="case-grid">${CASES.map(caseCard).join("")}</div></section>`;
  }

  function contact() {
    return `<section class="page-h"><div class="wrap"><span class="kicker">聯絡我們</span><h1>交通資訊與地圖</h1><p>${S.address}</p></div></section>
    <section class="wrap sec">${locationBlock()}
      <div class="contact-form"><h3>線上詢問（示意表單）</h3><div class="fgrid"><input placeholder="姓名"><input placeholder="聯絡電話"><input placeholder="車廠 / 車型，例如 BMW G20"><select><option>詢問項目</option>${TYPES.map(t => `<option>${t.name}</option>`).join("")}</select><textarea placeholder="想改裝的內容…"></textarea></div><button class="btn primary" onclick="App.toast('範例網站：表單不會實際送出')">送出詢問</button></div>
    </section>`;
  }

  /* ---------- 商品專區 ---------- */
  function parseQ(qs) { const o = {}; new URLSearchParams(qs || "").forEach((v, k) => o[k] = v); return o; }
  function qsOf(o) { const u = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== "" && v !== null) u.set(k, v); }); const s = u.toString(); return s ? "?" + s : ""; }

  function shop(q) {
    let list = PRODUCTS.slice();
    if (q.brand) list = list.filter(p => p.brand === q.brand);
    if (q.model) list = list.filter(p => p.model === q.model);
    if (q.type) list = list.filter(p => p.type === q.type);
    if (q.min) list = list.filter(p => p.price >= +q.min);
    if (q.max) list = list.filter(p => p.price <= +q.max);
    if (q.stock) list = list.filter(p => p.stock);
    if (q.q) { const k = q.q.toLowerCase(); list = list.filter(p => (p.name + typeOf(p.type).name + brandOf(p.brand).name + modelName(p.brand, p.model)).toLowerCase().includes(k)); }
    const sorts = { hot: (a, b) => b.hot - a.hot || b.rating - a.rating, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, new: (a, b) => b.id.localeCompare(a.id) };
    list.sort(sorts[q.sort] || sorts.hot);
    const pages = Math.max(1, Math.ceil(list.length / PER)); const page = Math.min(pages, Math.max(1, +q.page || 1));
    const shown = list.slice((page - 1) * PER, page * PER);
    const link = patch => "#/shop" + qsOf(Object.assign({}, q, { page: "" }, patch));
    const b = q.brand && brandOf(q.brand);
    const crumbs = [`<a href="#/shop">商品專區</a>`];
    if (b) crumbs.push(`<a href="${link({ model: "", type: "" })}">${b.name}</a>`);
    if (q.model) crumbs.push(`<a href="${link({ type: "" })}">${modelName(q.brand, q.model)}</a>`);
    if (q.type) crumbs.push(`<span>${typeOf(q.type).name}</span>`);
    const count = f => PRODUCTS.filter(f).length;
    const ranges = [["", "", "不限"], ["", "10000", "NT$1 萬以下"], ["10000", "30000", "1–3 萬"], ["30000", "80000", "3–8 萬"], ["80000", "", "8 萬以上"]];

    return `<section class="page-h slim"><div class="wrap"><div class="crumbs">${crumbs.join(" › ")}</div><h1>${q.type ? typeOf(q.type).name : q.model ? modelName(q.brand, q.model) : b ? b.name + " 改裝精品" : "商品專區"}</h1><p>${q.q ? `搜尋「${esc(q.q)}」・` : ""}共 ${list.length} 項商品<span class="muted">（範例資料・正式版可擴充至上千項）</span></p></div></section>
    <section class="wrap shop">
      <button class="btn ghost filter-toggle" onclick="document.body.classList.toggle('filters-open')">☰ 篩選條件</button>
      <aside class="filters">
        <div class="fblock"><h4>車廠</h4><ul>${BRANDS.map(x => `<li><a class="${q.brand === x.id ? "on" : ""}" href="${link({ brand: q.brand === x.id ? "" : x.id, model: "" })}">${x.name}<span>${count(p => p.brand === x.id)}</span></a>
          ${q.brand === x.id ? `<ul class="sub">${x.models.map(m => `<li><a class="${q.model === m[0] ? "on" : ""}" href="${link({ model: q.model === m[0] ? "" : m[0] })}">${m[1]}<span>${count(p => p.brand === x.id && p.model === m[0])}</span></a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul></div>
        <div class="fblock"><h4>商品類型</h4><ul>${TYPES.map(t => { const n = count(p => p.type === t.id && (!q.brand || p.brand === q.brand) && (!q.model || p.model === q.model)); return `<li><a class="${q.type === t.id ? "on" : ""} ${n ? "" : "dim"}" href="${link({ type: q.type === t.id ? "" : t.id })}">${t.name}<span>${n}</span></a></li>`; }).join("")}</ul></div>
        <div class="fblock"><h4>價格區間</h4><div class="chips">${ranges.map(r => `<a class="${(q.min || "") === r[0] && (q.max || "") === r[1] ? "on" : ""}" href="${link({ min: r[0], max: r[1] })}">${r[2]}</a>`).join("")}</div></div>
        <div class="fblock"><label class="chk"><input type="checkbox" ${q.stock ? "checked" : ""} onchange="location.hash='${link({ stock: q.stock ? "" : "1" })}'"> 只看現貨</label></div>
        <a class="btn ghost full" href="#/shop">清除全部條件</a>
      </aside>
      <div class="results">
        <div class="toolbar"><div class="active-tags">${[b && b.name, q.model && modelName(q.brand, q.model), q.type && typeOf(q.type).name, (q.min || q.max) && `${q.min ? money(+q.min) : "0"} – ${q.max ? money(+q.max) : "∞"}`].filter(Boolean).map(t => `<span>${t}</span>`).join("")}</div>
          <select onchange="location.hash='${link({ sort: "SORTV" })}'.replace('SORTV',this.value)">${[["hot", "熱門優先"], ["new", "最新上架"], ["low", "價格低 → 高"], ["high", "價格高 → 低"]].map(o => `<option value="${o[0]}" ${q.sort === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select></div>
        ${shown.length ? `<div class="pgrid">${shown.map(card).join("")}</div>` : `<div class="empty">找不到符合條件的商品，請調整篩選條件。<br><a href="#/contact">或直接聯絡我們詢問 →</a></div>`}
        ${pages > 1 ? `<div class="pager">${page > 1 ? `<a href="${link({ page: page - 1 })}">‹ 上一頁</a>` : ""}${Array.from({ length: pages }, (_, i) => `<a class="${i + 1 === page ? "on" : ""}" href="${link({ page: i + 1 })}">${i + 1}</a>`).join("")}${page < pages ? `<a href="${link({ page: page + 1 })}">下一頁 ›</a>` : ""}</div>` : ""}
      </div></section>`;
  }

  function product(id) {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return `<div class="wrap sec empty">找不到商品</div>`;
    const b = brandOf(p.brand), t = typeOf(p.type);
    const rel = PRODUCTS.filter(x => x.id !== p.id && (x.model === p.model || x.type === p.type)).slice(0, 4);
    return `<section class="wrap sec"><div class="crumbs"><a href="#/shop">商品專區</a> › <a href="#/shop?brand=${b.id}">${b.name}</a> › <a href="#/shop?brand=${b.id}&model=${p.model}">${modelName(p.brand, p.model)}</a> › <a href="#/shop?brand=${b.id}&model=${p.model}&type=${p.type}">${t.name}</a></div>
    <div class="pd">
      <div class="gallery"><img id="mainImg" src="${img(p, 0)}" alt=""><div class="thumbs">${[0, 1, 2, 3].map(v => `<img src="${img(p, v)}" onclick="document.getElementById('mainImg').src=this.src" alt="">`).join("")}</div></div>
      <div class="pd-info"><span class="badge sample inline">範例資料</span> ${p.hot ? '<span class="badge hot inline">熱銷</span>' : ""}
        <h1>${esc(p.name)}</h1><div class="muted">商品編號 ${p.id}・★ ${p.rating}</div>
        <div class="pd-price"><b>${money(p.price)}</b>${p.orig ? `<s>${money(p.orig)}</s>` : ""}<small>價格為範例</small></div>
        <div class="pd-stock">${p.stock ? '<span class="ok">● 現貨供應</span>' : '<span class="warn">● 預購商品，約 7–14 個工作天</span>'}</div>
        <div class="opt"><h4>適用車型</h4><div class="chips">${p.compat.map(c => `<span class="on">${b.name} ${c}</span>`).join("")}</div></div>
        <div class="opt"><h4>購買方式</h4><div class="chips sel" onclick="if(event.target.tagName==='SPAN'){[...this.children].forEach(c=>c.classList.remove('on'));event.target.classList.add('on')}"><span class="on">商品 + 到店安裝</span><span>僅購買商品（宅配）</span></div></div>
        <div class="buy"><div class="qty"><button onclick="App.qty(-1)">−</button><input id="qty" value="1" inputmode="numeric"><button onclick="App.qty(1)">+</button></div>
          <button class="btn primary" onclick="App.add('${p.id}')">加入購物車</button><button class="btn ghost" onclick="App.add('${p.id}',true)">立即購買</button></div>
        <ul class="perks"><li>✔ 下單前可來電確認相容性：<a href="tel:${S.tel}">${S.phone}</a></li><li>✔ 支援信用卡、LINE Pay、ATM、超商取貨付款（上線時串接）</li><li>✔ 到店安裝地點：${S.address}</li></ul>
      </div></div>
    <div class="pd-tabs two"><div><h3>商品規格</h3><table class="spec">${Object.entries(Object.assign({ "車廠": b.name, "車型 / 底盤": modelName(p.brand, p.model), "商品類型": t.name }, p.specs)).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table></div>
      <div><h3>商品說明</h3><p>此為範例商品說明。正式上線時，每項商品可放入詳細介紹、安裝說明、施工影片與實車照片。伊豆精品提供到店安裝服務，安裝前會再次確認車輛年份與配備是否相容。</p><p class="muted small">※ 改裝零件是否符合驗車法規，請於購買前與我們確認。</p></div></div>
    <div class="sec-h"><h2>你可能也喜歡</h2></div><div class="pgrid">${rel.map(card).join("")}</div></section>`;
  }

  function cartPage() {
    const c = cart.get(); const items = c.map(i => ({ p: PRODUCTS.find(x => x.id === i.id), q: i.q })).filter(i => i.p);
    const sub = items.reduce((a, i) => a + i.p.price * i.q, 0);
    if (!items.length) return `<section class="wrap sec empty"><h2>購物車是空的</h2><p><a class="btn primary" href="#/shop">去逛逛商品專區 →</a></p></section>`;
    return `<section class="wrap sec"><h1>購物車</h1><div class="checkout"><div class="lines">${items.map(i => `<div class="line"><img src="${img(i.p)}" alt=""><div><a href="#/product/${i.p.id}"><b>${esc(i.p.name)}</b></a><div class="muted small">${i.p.id}・範例商品</div></div><div class="qty sm"><button onclick="App.setQ('${i.p.id}',${i.q - 1})">−</button><input value="${i.q}" readonly><button onclick="App.setQ('${i.p.id}',${i.q + 1})">+</button></div><b>${money(i.p.price * i.q)}</b><button class="x" onclick="App.setQ('${i.p.id}',0)">✕</button></div>`).join("")}</div>
    <aside class="summary"><h3>訂單摘要</h3><div class="row"><span>商品小計</span><b>${money(sub)}</b></div><div class="row muted"><span>運費</span><span>結帳時計算</span></div><div class="row total"><span>合計</span><b>${money(sub)}</b></div><a class="btn primary full" href="#/checkout">前往結帳</a><a class="btn ghost full" href="#/shop">繼續購物</a></aside></div></section>`;
  }

  const PAY = [["card", "信用卡（一次付清 / 分期）", "Visa・Master・JCB，上線後跳轉綠界安全付款頁"], ["linepay", "LINE Pay", "跳轉 LINE Pay 完成付款"], ["atm", "ATM 轉帳 / 虛擬帳號", "下單後產生專屬虛擬帳號"], ["cvs", "超商取貨付款", "7-ELEVEN・全家・萊爾富・OK"]];
  const SHIP = [["store", "到店安裝 / 自取", 0, S.address], ["home", "宅配到府（黑貓）", 150, "1–3 個工作天"], ["cvs", "超商取貨", 60, "7-ELEVEN・全家・萊爾富・OK"]];

  function checkout() {
    const c = cart.get(); const items = c.map(i => ({ p: PRODUCTS.find(x => x.id === i.id), q: i.q })).filter(i => i.p);
    if (!items.length) return cartPage();
    const sub = items.reduce((a, i) => a + i.p.price * i.q, 0);
    return `<section class="wrap sec"><div class="steps"><span class="done">1 購物車</span><span class="on">2 填寫資料與付款</span><span>3 完成訂單</span></div>
    <div class="checkout"><div>
      <div class="box"><h3>訂購人資料</h3><div class="fgrid"><input placeholder="姓名"><input placeholder="手機號碼"><input placeholder="Email"><input placeholder="車廠 / 車型（安裝用，例如 BMW G20）"></div></div>
      <div class="box"><h3>配送方式</h3>${SHIP.map((s, i) => `<label class="opt-row"><input type="radio" name="ship" value="${s[0]}" data-fee="${s[2]}" ${i ? "" : "checked"} onchange="App.fee()"><div><b>${s[1]}</b><span>${s[3]}</span></div><em>${s[2] ? money(s[2]) : "免運"}</em></label>`).join("")}</div>
      <div class="box"><h3>付款方式</h3>${PAY.map((p, i) => `<label class="opt-row"><input type="radio" name="pay" value="${p[0]}" ${i ? "" : "checked"}><div><b>${p[1]}</b><span>${p[2]}</span></div><em class="paylogo">${["💳", "🟢", "🏦", "🏪"][i]}</em></label>`).join("")}
        <div class="notice">🔒 <b>範例網站不會收取任何款項，也不需要輸入卡號。</b><br>正式上線時，付款將串接 <b>綠界 ECPay</b>（或 SHOPLINE / CYBERBIZ 平台內建金流），信用卡資料只會在金流商的安全頁面輸入，本站不經手卡號。</div></div>
      <div class="box"><h3>備註</h3><textarea placeholder="希望安裝日期、其他需求…"></textarea></div>
    </div>
    <aside class="summary"><h3>訂單摘要</h3>${items.map(i => `<div class="row small"><span>${esc(i.p.name)} × ${i.q}</span><span>${money(i.p.price * i.q)}</span></div>`).join("")}
      <div class="row"><span>商品小計</span><b>${money(sub)}</b></div><div class="row"><span>運費</span><b id="feeV">免運</b></div><div class="row total"><span>應付金額</span><b id="totV" data-sub="${sub}">${money(sub)}</b></div>
      <button class="btn primary full" onclick="App.place()">確認下單（示意）</button><p class="muted small">點擊後僅顯示範例訂單完成頁，不會建立真實訂單。</p></aside></div></section>`;
  }

  function order(no) {
    const o = JSON.parse(sessionStorage.getItem("izu_order") || "{}");
    return `<section class="wrap sec done-page"><div class="steps"><span class="done">1 購物車</span><span class="done">2 填寫資料與付款</span><span class="on">3 完成訂單</span></div>
    <div class="done-card"><div class="check">✓</div><h1>訂單已成立（範例）</h1><p>訂單編號 <b>${esc(no)}</b></p>
    <div class="row"><span>付款方式</span><b>${o.pay || "-"}</b></div><div class="row"><span>配送方式</span><b>${o.ship || "-"}</b></div><div class="row"><span>應付金額</span><b>${o.total ? money(o.total) : "-"}</b></div>
    <p class="muted">正式上線後，系統將寄送訂單確認信，並由伊豆精品來電確認安裝時間。<br>如有問題請來電 <a href="tel:${S.tel}">${S.phone}</a>（${S.hours}）</p>
    <div class="btns center"><a class="btn primary" href="#/shop">繼續購物</a><a class="btn ghost" href="#/">回首頁</a></div></div></section>`;
  }

  /* ---------- 路由 ---------- */
  function route() {
    const h = location.hash.slice(1) || "/"; const [path, qs] = h.split("?"); const seg = path.split("/").filter(Boolean);
    const q = parseQ(qs); let html;
    switch (seg[0]) {
      case undefined: html = home(); break;
      case "about": html = about(); break;
      case "services": html = services(); break;
      case "shop": html = shop(q); break;
      case "product": html = product(seg[1]); break;
      case "cases": html = cases(); break;
      case "contact": html = contact(); break;
      case "cart": html = cartPage(); break;
      case "checkout": html = checkout(); break;
      case "order": html = order(seg[1]); break;
      default: html = home();
    }
    app.innerHTML = html;
    document.body.classList.remove("nav-open", "filters-open");
    document.querySelectorAll("#nav a").forEach(a => { const t = a.getAttribute("href").slice(1); a.classList.toggle("active", t === "/" ? path === "/" : ("/" + (seg[0] === "product" ? "shop" : seg[0])) === t); });
    window.scrollTo(0, 0);
  }

  window.App = {
    toast,
    search(f) { location.hash = "#/shop?q=" + encodeURIComponent(f.q.value.trim()); return false; },
    qty(d) { const i = $("#qty"); i.value = Math.max(1, (+i.value || 1) + d); },
    add(id, now) { cart.add(id, Math.max(1, +($("#qty") || {}).value || 1)); toast("已加入購物車"); if (now) location.hash = "#/checkout"; },
    setQ(id, n) { let c = cart.get(); if (n <= 0) c = c.filter(x => x.id !== id); else c.find(x => x.id === id).q = n; cart.set(c); route(); },
    fee() { const r = document.querySelector("input[name=ship]:checked"); const f = +r.dataset.fee; const t = $("#totV"); $("#feeV").textContent = f ? money(f) : "免運"; t.textContent = money(+t.dataset.sub + f); },
    place() {
      const pay = document.querySelector("input[name=pay]:checked").closest("label").querySelector("b").textContent;
      const sr = document.querySelector("input[name=ship]:checked"); const ship = sr.closest("label").querySelector("b").textContent;
      const total = +$("#totV").dataset.sub + (+sr.dataset.fee);
      const no = "P" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + Math.floor(1000 + Math.random() * 9000);
      sessionStorage.setItem("izu_order", JSON.stringify({ pay, ship, total })); cart.set([]); location.hash = "#/order/" + no;
    }
  };

  $("#footInfo").innerHTML = `${S.address}<br>電話 <a href="tel:${S.tel}">${S.phone}</a><br>${S.hours}<br><a href="${S.mapNav}" target="_blank" rel="noopener">📍 Google 地圖導航</a><br><a class="ig-link" href="${S.instagram}" target="_blank" rel="noopener">Instagram ${S.ig}</a>`;
  window.addEventListener("hashchange", route); updateCount(); route();
})();
