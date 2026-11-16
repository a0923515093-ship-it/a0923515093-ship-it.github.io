/* 毅德國際 範例資料 —— 所有商品、價格皆為範例（placeholder），正式上線時由後台/CSV 匯入，可擴充至上千筆 */
window.STORE = {
  name: "毅德國際", en: "YIDE Performance",
  address: "嘉義市西區保福一路120之一號",
  phone: "05-238-5510", tel: "+88652385510",
  hours: "週一至週五 09:00–18:00",
  ig: "yide_performance",
  mapEmbed: "https://www.google.com/maps?q=" + encodeURIComponent("嘉義市西區保福一路120之一號") + "&hl=zh-TW&z=16&output=embed",
  mapNav: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent("嘉義市西區保福一路120之一號")
};

window.BRANDS = [
  { id: "bmw", name: "BMW", color: "#1c69d4", models: [["g20","3系列 G20"],["f30","3系列 F30"],["g80","M3 G80"],["g30","5系列 G30"],["g05","X5 G05"]] },
  { id: "benz", name: "Mercedes-Benz", color: "#a8b0b8", models: [["w206","C-Class W206"],["w205","C-Class W205"],["w213","E-Class W213"],["c118","CLA C118"]] },
  { id: "audi", name: "Audi", color: "#bb0a30", models: [["b9","A4 / S4 B9"],["8y","A3 / S3 8Y"],["rs3","RS3 8Y"]] },
  { id: "porsche", name: "Porsche", color: "#d5a021", models: [["992","911 (992)"],["982","718 Cayman / Boxster"],["macan","Macan 95B"]] },
  { id: "vw", name: "Volkswagen", color: "#2f6fb6", models: [["mk8","Golf 8 / GTI / R"],["mk7","Golf 7 / GTI / R"],["arteon","Arteon"]] },
  { id: "toyota", name: "Toyota", color: "#eb0a1e", models: [["gr86","GR86"],["grcorolla","GR Corolla"],["rav4","RAV4 5代"]] },
  { id: "lexus", name: "Lexus", color: "#8b8f94", models: [["is","IS 300 / 350"],["nx","NX 2代"],["rc","RC / RC F"]] },
  { id: "honda", name: "Honda", color: "#cc0000", models: [["fk8","Civic Type R FK8"],["fl5","Civic Type R FL5"],["fe","Civic 11代"]] },
  { id: "ferrari", name: "Ferrari", color: "#ff2800", models: [["f8","F8 Tributo"],["296","296 GTB"],["roma","Roma"]] },
  { id: "lamborghini", name: "Lamborghini", color: "#ddb321", models: [["huracan","Huracán"],["urus","Urus"]] }
];

window.TYPES = [
  { id: "paddle", name: "撥片", icon: "paddle" },
  { id: "exhaust", name: "排氣管", icon: "exhaust" },
  { id: "suspension", name: "避震 / 懸吊", icon: "suspension" },
  { id: "wheel", name: "輪圈", icon: "wheel" },
  { id: "brake", name: "煞車", icon: "brake" },
  { id: "intake", name: "進氣", icon: "intake" },
  { id: "aero", name: "外觀套件", icon: "aero" },
  { id: "interior", name: "內裝", icon: "interior" },
  { id: "tuning", name: "電腦調校 / 改裝服務", icon: "tuning" }
];

window.SERVICES = [
  { icon: "paddle", t: "方向盤撥片升級", d: "原廠預留設計直上，鋁合金 / 碳纖維材質，加長、磁吸回饋，現場安裝不破壞原車。" },
  { icon: "exhaust", t: "排氣系統改裝", d: "中尾段、閥門排氣、當派管，聲浪調校與驗車法規諮詢。" },
  { icon: "suspension", t: "避震懸吊調整", d: "高低軟硬可調避震、降低彈簧、定位調整，兼顧日常舒適與操控。" },
  { icon: "wheel", t: "鍛造輪圈 / 輪胎", d: "依車型 PCD、ET 值建議尺寸，代客訂製鍛造輪圈，動平衡與定位一次完成。" },
  { icon: "brake", t: "煞車系統升級", d: "多活塞卡鉗、加大碟盤、來令片與煞車油更換，提升熱衰退表現。" },
  { icon: "tuning", t: "ECU 電腦調校", d: "Stage 1 / Stage 2 動力程式，上下馬力機實測，保留原廠程式可還原。" },
  { icon: "aero", t: "空力外觀套件", d: "前下巴、側裙、後擾流、碳纖維套件，噴漆與安裝一條龍。" },
  { icon: "interior", t: "內裝精品 / 氛圍燈", d: "碳纖維飾板、跑車座椅、方向盤包覆與氛圍燈加裝。" }
];

window.CASES = [
  { t: "BMW G20 330i｜碳纖維撥片 + 閥門排氣", brand: "bmw", tags: ["撥片","排氣管"] },
  { t: "BMW G80 M3｜Stage 1 調校 + 碳纖維尾翼", brand: "bmw", tags: ["電腦調校","外觀套件"] },
  { t: "Porsche 992 Carrera｜鍛造輪圈 21/20 吋", brand: "porsche", tags: ["輪圈"] },
  { t: "Benz W206 C300｜AMG 式樣外觀 + 降低彈簧", brand: "benz", tags: ["外觀套件","避震 / 懸吊"] },
  { t: "VW Golf 8 R｜進氣套件 + Stage 2", brand: "vw", tags: ["進氣","電腦調校"] },
  { t: "Toyota GR86｜絞牙避震 + 六活塞卡鉗", brand: "toyota", tags: ["避震 / 懸吊","煞車"] },
  { t: "Audi RS3 8Y｜鈦合金當派 + 撥片", brand: "audi", tags: ["排氣管","撥片"] },
  { t: "Honda FL5｜碳纖維進氣 + 輕量化輪圈", brand: "honda", tags: ["進氣","輪圈"] },
  { t: "Ferrari F8｜加長碳纖維撥片", brand: "ferrari", tags: ["撥片"] }
];

/* ---- 範例商品產生器（固定亂數種子，結果每次相同）---- */
(function () {
  let s = 20261116; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const T = {
    paddle: { names: ["碳纖維加長撥片","鋁合金鍛造撥片","磁吸式換檔撥片","鍛造碳撥片 Pro","賽道版加長撥片","紅色陽極鋁撥片"], price: [4800, 16800], specs: { "材質": ["乾式碳纖維","6061 鋁合金","鍛造碳纖維"], "安裝方式": ["原廠孔位直上","免剪線直上"], "保固": ["一年"] } },
    exhaust: { names: ["閥門中尾段排氣","鈦合金當派管","不鏽鋼全段排氣","碳纖維尾飾管"], price: [18000, 168000], specs: { "材質": ["SUS304 不鏽鋼","鈦合金","不鏽鋼 + 碳纖維尾飾"], "閥門": ["遙控閥門","無"], "驗車": ["需確認法規","附檢測報告（範例）"] } },
    suspension: { names: ["32 段高低軟硬可調避震","運動型降低彈簧","電子可調避震套件","強化防傾桿組"], price: [9800, 89000], specs: { "調整": ["32 段阻尼","高低可調","固定式"], "降低幅度": ["約 25–35mm","約 30–50mm"], "保固": ["一年","兩年"] } },
    wheel: { names: ["單片鍛造輪圈 19 吋","單片鍛造輪圈 20 吋","兩片式鍛造輪圈","輕量化旋壓輪圈 18 吋"], price: [36000, 220000], specs: { "製程": ["單片鍛造","兩片式鍛造","旋壓鑄造"], "顏色": ["消光黑","槍灰","亮銀","古銅金"], "單位": ["一組四顆"] } },
    brake: { names: ["前六活塞卡鉗套件","前四活塞卡鉗套件","陶瓷來令片","劃線打孔碟盤"], price: [3800, 128000], specs: { "活塞數": ["6 活塞","4 活塞","—"], "碟盤": ["380mm 兩片式","355mm","原廠尺寸"], "適用": ["街道 / 賽道"] } },
    intake: { names: ["碳纖維密閉式進氣","高流量空氣濾芯","強化渦輪進氣管","中冷器升級套件"], price: [3200, 46000], specs: { "材質": ["乾式碳纖維","矽膠 + 鋁管","棉質濾芯"], "增益": ["約 +5–10hp（範例）","依車況而定"] } },
    aero: { names: ["碳纖維前下巴","碳纖維側裙","鴨尾 / 尾翼","後下巴擾流"], price: [12000, 86000], specs: { "材質": ["乾式碳纖維","濕式碳纖維","FRP 可烤漆"], "工法": ["預浸料熱壓","手糊"] } },
    interior: { names: ["碳纖維方向盤","碳纖維中控飾板","氛圍燈套件","跑車鋁合金踏板"], price: [2800, 38000], specs: { "材質": ["碳纖維 + 麂皮","碳纖維","鋁合金"], "安裝": ["含安裝","DIY 可"] } },
    tuning: { names: ["Stage 1 動力調校","Stage 2 動力調校","變速箱 TCU 調校","馬力機實測服務"], price: [6000, 58000], specs: { "服務型態": ["到店施工","需預約"], "工時": ["約 2–4 小時","約 1 個工作天"], "還原": ["可還原原廠程式"] } }
  };
  const P = []; let id = 1001;
  BRANDS.forEach(b => b.models.forEach(([mid, mname]) => {
    const types = TYPES.map(t => t.id).sort(() => rnd() - 0.5).slice(0, 3);
    if (!types.includes("paddle") && rnd() > 0.35) types[0] = "paddle";
    if (b.id === "bmw" && mid === "g20") { types.length = 0; types.push("paddle","paddle","paddle","paddle","paddle","paddle","exhaust","suspension","wheel","brake","intake","tuning"); }
    types.forEach((tid, i) => {
      const t = T[tid]; const name = (b.id === "bmw" && mid === "g20" && tid === "paddle") ? t.names[i % t.names.length] : pick(t.names);
      const price = Math.round((t.price[0] + rnd() * (t.price[1] - t.price[0])) / 100) * 100;
      const specs = {}; Object.entries(t.specs).forEach(([k, v]) => specs[k] = pick(v));
      const compat = [mname]; if (rnd() > 0.5) { const o = b.models.find(m => m[0] !== mid); if (o) compat.push(o[1]); }
      P.push({
        id: "YD" + (id++), brand: b.id, model: mid, type: tid,
        name: `${b.name} ${mname} ${name}`, price,
        orig: rnd() > 0.7 ? Math.round(price * 1.15 / 100) * 100 : null,
        stock: rnd() > 0.15, hot: rnd() > 0.8, rating: (4 + rnd()).toFixed(1),
        specs, compat, sample: true
      });
    });
  }));
  window.PRODUCTS = P;
})();
