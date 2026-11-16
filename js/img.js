/* 本地產生的 SVG 示意圖（不使用任何外部/版權圖片） */
(function () {
  const ICON = {
    paddle: '<path d="M60 100 a60 60 0 1 0 120 0 a60 60 0 1 0 -120 0" fill="none" stroke="C" stroke-width="10"/><path d="M95 100h50M120 100v40" stroke="C" stroke-width="10" stroke-linecap="round"/><path d="M40 70 q-20 30 0 60 l10 -5 q-14 -25 0 -50z M200 70 q20 30 0 60 l-10 -5 q14 -25 0 -50z" fill="C"/>',
    exhaust: '<path d="M30 110 h110 q20 0 20 -20 v-10" fill="none" stroke="C" stroke-width="14" stroke-linecap="round"/><ellipse cx="185" cy="110" rx="22" ry="28" fill="none" stroke="C" stroke-width="10"/><ellipse cx="185" cy="110" rx="10" ry="14" fill="C"/>',
    suspension: '<path d="M120 30 v30 M120 170 v30" stroke="C" stroke-width="12"/><path d="M90 60 h60 M90 170 h60" stroke="C" stroke-width="8"/><path d="M95 70 l50 12 l-50 12 l50 12 l-50 12 l50 12 l-50 12 l50 12" fill="none" stroke="C" stroke-width="7"/>',
    wheel: '<circle cx="120" cy="115" r="80" fill="none" stroke="C" stroke-width="12"/><circle cx="120" cy="115" r="16" fill="C"/>' + [0,72,144,216,288].map(a=>`<path d="M120 115 L120 45" stroke="C" stroke-width="10" transform="rotate(${a} 120 115)"/>`).join(''),
    brake: '<circle cx="120" cy="115" r="75" fill="none" stroke="C" stroke-width="8"/><circle cx="120" cy="115" r="28" fill="none" stroke="C" stroke-width="6"/><path d="M60 50 q-30 65 0 130 l30 -12 q-22 -53 0 -106z" fill="C"/>',
    intake: '<path d="M40 80 h100 l40 -30 v130 l-40 -30 h-100z" fill="none" stroke="C" stroke-width="10" stroke-linejoin="round"/><path d="M60 100 h60 M60 120 h60" stroke="C" stroke-width="6"/>',
    aero: '<path d="M20 140 q40 -70 120 -70 q60 0 80 40 l0 30 z" fill="none" stroke="C" stroke-width="9" stroke-linejoin="round"/><circle cx="70" cy="145" r="18" fill="C"/><circle cx="180" cy="145" r="18" fill="C"/><path d="M170 60 h55 v10 h-55z" fill="C"/>',
    interior: '<path d="M70 190 l15 -110 q5 -30 35 -30 q30 0 35 30 l15 110z" fill="none" stroke="C" stroke-width="10" stroke-linejoin="round"/><path d="M95 100 h50" stroke="C" stroke-width="8"/>',
    tuning: '<rect x="50" y="60" width="140" height="100" rx="10" fill="none" stroke="C" stroke-width="10"/><path d="M70 140 l25 -30 l20 15 l30 -40 l25 20" fill="none" stroke="C" stroke-width="8" stroke-linejoin="round"/><path d="M80 175 h80" stroke="C" stroke-width="10"/>'
  };
  window.svgImg = function (type, label, accent, variant) {
    accent = accent || "#ff3b30"; variant = variant || 0;
    const bg = ["#15171c","#1b1e25","#121418","#20232b"][variant % 4];
    const ic = (ICON[type] || ICON.tuning).replace(/C/g, accent);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#0a0b0d"/></linearGradient><pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="#ffffff" opacity=".025"/></pattern></defs><rect width="400" height="300" fill="url(#g)"/><rect width="400" height="300" fill="url(#p)"/><path d="M0 260 L400 200 L400 214 L0 274z" fill="${accent}" opacity=".18"/><g transform="translate(${80 + variant * 6} 25) scale(${1 - variant * 0.05})">${ic}</g><text x="20" y="30" font-family="sans-serif" font-size="13" fill="#8a8f98">${label || ""}</text><text x="380" y="285" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="700" fill="#ffffff" opacity=".35">YIDE · 範例圖</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
})();
