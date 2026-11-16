// TODO: replace with official LINE link
const LINE_URL = "https://line.me/";

const SHEET = {
  id: "1R-hDq19gxIxLNrIX9x6uhj_sKzFsWlpbbfA13LM_V3U",
  tab: "商品"
};

window.STORE = {
  name: "伊豆精品",
  nameEn: "EDO TUNING",
  address: "嘉義市西區保福一路120之一號",
  phone: "05-238-5510",
  tel: "+88652385510",
  hours: "週一至週五 09:00–18:00",
  instagram: "https://www.instagram.com/edotuning",
  ig: "@edotuning",
  intro: "嘉義汽車改裝精品，商品與安裝歡迎 LINE 詢問。"
};

window.PRODUCTS = [];

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
  { id: "paddle", name: "撥片" },
  { id: "exhaust", name: "排氣管" },
  { id: "suspension", name: "避震 / 懸吊" },
  { id: "wheel", name: "輪圈" },
  { id: "brake", name: "煞車" },
  { id: "intake", name: "進氣" },
  { id: "aero", name: "外觀套件" },
  { id: "interior", name: "內裝" },
  { id: "tuning", name: "電腦調校 / 改裝服務" }
];
