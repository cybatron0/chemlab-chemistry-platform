/**
 * Dot-and-Cross (Lewis-style) Diagram Generator
 * Produces clean SVG representations for common molecules and ions.
 */
const DIAGRAM_DATA = {
  H2: { name: "Hydrogen (H₂)", type: "covalent", description: "Two hydrogen atoms share one pair of electrons forming a single covalent bond.", svg: () => diatomicCovalent("H", "H", 1, false) },
  O2: { name: "Oxygen (O₂)", type: "covalent", description: "Two oxygen atoms share two pairs of electrons (double bond). Each has two lone pairs.", svg: () => diatomicCovalent("O", "O", 2, true) },
  N2: { name: "Nitrogen (N₂)", type: "covalent", description: "Two nitrogen atoms share three pairs of electrons (triple bond). Each has one lone pair.", svg: () => diatomicCovalent("N", "N", 3, true) },
  Cl2: { name: "Chlorine (Cl₂)", type: "covalent", description: "Two chlorine atoms share one pair of electrons. Each has three lone pairs.", svg: () => diatomicCovalent("Cl", "Cl", 1, true) },
  HCl: { name: "Hydrogen Chloride (HCl)", type: "covalent", description: "Hydrogen and chlorine share one pair of electrons. Chlorine has three lone pairs.", svg: () => heteroDiatomic("H", "Cl", 1) },
  H2O: { name: "Water (H₂O)", type: "covalent", description: "Oxygen shares one pair with each hydrogen. Oxygen has two lone pairs. Bent shape.", svg: () => waterDiagram() },
  NH3: { name: "Ammonia (NH₃)", type: "covalent", description: "Nitrogen shares one pair with each of three hydrogens. Nitrogen has one lone pair. Trigonal pyramidal.", svg: () => ammoniaDiagram() },
  CH4: { name: "Methane (CH₄)", type: "covalent", description: "Carbon shares one pair with each of four hydrogens. Tetrahedral. No lone pairs on carbon.", svg: () => methaneDiagram() },
  CO2: { name: "Carbon Dioxide (CO₂)", type: "covalent", description: "Carbon forms two double bonds with two oxygen atoms. Linear. Each oxygen has two lone pairs.", svg: () => co2Diagram() },
  H2S: { name: "Hydrogen Sulfide (H₂S)", type: "covalent", description: "Similar to water: sulfur shares one pair with each hydrogen and has two lone pairs.", svg: () => h2sDiagram() },
  C2H4: { name: "Ethene (C₂H₄)", type: "covalent", description: "Two carbons joined by a double bond; each carbon bonded to two hydrogens. Planar.", svg: () => etheneDiagram() },
  C2H2: { name: "Ethyne / Acetylene (C₂H₂)", type: "covalent", description: "Two carbons joined by a triple bond; each carbon bonded to one hydrogen. Linear.", svg: () => ethyneDiagram() },
  NaCl: { name: "Sodium Chloride (NaCl)", type: "ionic", description: "Sodium transfers its one valence electron to chlorine. Na⁺ and Cl⁻ ions form an ionic lattice.", svg: () => ionicPair("Na", "Cl", 1, 7) },
  MgO: { name: "Magnesium Oxide (MgO)", type: "ionic", description: "Magnesium transfers two valence electrons to oxygen. Mg²⁺ and O²⁻.", svg: () => ionicPair("Mg", "O", 2, 6) },
  CaCl2: { name: "Calcium Chloride (CaCl₂)", type: "ionic", description: "Calcium transfers two electrons, one to each chlorine. Ca²⁺ and two Cl⁻.", svg: () => ionicCaCl2() },
  Na2O: { name: "Sodium Oxide (Na₂O)", type: "ionic", description: "Two sodium atoms each transfer one electron to oxygen. Two Na⁺ and O²⁻.", svg: () => ionicNa2O() },
  "NH4+": { name: "Ammonium ion (NH₄⁺)", type: "ion", description: "Nitrogen bonded to four hydrogens. Overall positive charge. Tetrahedral.", svg: () => ammoniumDiagram() },
  "OH-": { name: "Hydroxide ion (OH⁻)", type: "ion", description: "Oxygen bonded to one hydrogen with three lone pairs. Overall negative charge.", svg: () => hydroxideDiagram() },
  "SO42-": { name: "Sulfate ion (SO₄²⁻)", type: "ion", description: "Sulfur at centre bonded to four oxygens. Expanded octet / resonance. Overall 2− charge.", svg: () => sulfateDiagram() }
};

function circle(cx, cy, r, fill = "none", stroke = "#22d3ee", sw = 2) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function text(x, y, content, size = 16, weight = "600", fill = "#e6edf5") {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, sans-serif">${content}</text>`;
}
function electron(x, y, type = "dot") {
  if (type === "cross") {
    const s = 4;
    return `<g stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round"><line x1="${x - s}" y1="${y - s}" x2="${x + s}" y2="${y + s}"/><line x1="${x + s}" y1="${y - s}" x2="${x - s}" y2="${y + s}"/></g>`;
  }
  return `<circle cx="${x}" cy="${y}" r="3.2" fill="#34d399"/>`;
}
function lonePair(cx, cy, angleDeg, type = "dot") {
  const rad = (angleDeg * Math.PI) / 180;
  const dist = 28;
  const dx = Math.cos(rad) * dist;
  const dy = Math.sin(rad) * dist;
  const px = -Math.sin(rad) * 6;
  const py = Math.cos(rad) * 6;
  return electron(cx + dx + px, cy + dy + py, type) + electron(cx + dx - px, cy + dy - py, type);
}
function bondPair(cx1, cy1, cx2, cy2, typeLeft = "dot", typeRight = "cross") {
  const mx = (cx1 + cx2) / 2;
  const my = (cy1 + cy2) / 2;
  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = (-dy / len) * 7;
  const py = (dx / len) * 7;
  return electron(mx + px, my + py, typeLeft) + electron(mx - px, my - py, typeRight);
}
function diatomicCovalent(a, b, bonds, showLones) {
  const w = 320, h = 180;
  const cx1 = 110, cy = 90, cx2 = 210;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(cx1, cy, 38);
  svg += circle(cx2, cy, 38);
  svg += text(cx1, cy, a);
  svg += text(cx2, cy, b);
  for (let i = 0; i < bonds; i++) {
    const offset = (i - (bonds - 1) / 2) * 14;
    svg += bondPair(cx1, cy + offset, cx2, cy + offset, "dot", "cross");
  }
  if (showLones) {
    if (a === "O" || a === "S") { svg += lonePair(cx1, cy, 180, "dot"); svg += lonePair(cx1, cy, 90, "dot"); }
    else if (a === "N") svg += lonePair(cx1, cy, 180, "dot");
    else if (a === "Cl") { svg += lonePair(cx1, cy, 150, "dot"); svg += lonePair(cx1, cy, 210, "dot"); svg += lonePair(cx1, cy, 90, "dot"); }
    if (b === "O" || b === "S") { svg += lonePair(cx2, cy, 0, "cross"); svg += lonePair(cx2, cy, 270, "cross"); }
    else if (b === "N") svg += lonePair(cx2, cy, 0, "cross");
    else if (b === "Cl") { svg += lonePair(cx2, cy, 30, "cross"); svg += lonePair(cx2, cy, -30, "cross"); svg += lonePair(cx2, cy, 90, "cross"); }
  }
  svg += `</svg>`;
  return svg;
}
function heteroDiatomic(a, b, bonds) { return diatomicCovalent(a, b, bonds, true); }
function waterDiagram() {
  const w = 340, h = 220;
  const ox = 170, oy = 100;
  const hx1 = 100, hy1 = 160;
  const hx2 = 240, hy2 = 160;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(ox, oy, 36);
  svg += circle(hx1, hy1, 28);
  svg += circle(hx2, hy2, 28);
  svg += text(ox, oy, "O");
  svg += text(hx1, hy1, "H");
  svg += text(hx2, hy2, "H");
  svg += bondPair(ox, oy, hx1, hy1, "cross", "dot");
  svg += bondPair(ox, oy, hx2, hy2, "cross", "dot");
  svg += lonePair(ox, oy, -50, "cross");
  svg += lonePair(ox, oy, -130, "cross");
  svg += `</svg>`;
  return svg;
}
function ammoniaDiagram() {
  const w = 360, h = 240;
  const nx = 180, ny = 90;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(nx, ny, 36);
  svg += circle(100, 160, 26);
  svg += circle(180, 190, 26);
  svg += circle(260, 160, 26);
  svg += text(nx, ny, "N");
  svg += text(100, 160, "H");
  svg += text(180, 190, "H");
  svg += text(260, 160, "H");
  svg += bondPair(nx, ny, 100, 160, "cross", "dot");
  svg += bondPair(nx, ny, 180, 190, "cross", "dot");
  svg += bondPair(nx, ny, 260, 160, "cross", "dot");
  svg += lonePair(nx, ny, -90, "cross");
  svg += `</svg>`;
  return svg;
}
function methaneDiagram() {
  const w = 360, h = 260;
  const cx = 180, cy = 120;
  const hs = [{ x: 100, y: 70 }, { x: 260, y: 70 }, { x: 100, y: 180 }, { x: 260, y: 180 }];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(cx, cy, 36);
  hs.forEach(h => {
    svg += circle(h.x, h.y, 26);
    svg += text(h.x, h.y, "H");
    svg += bondPair(cx, cy, h.x, h.y, "cross", "dot");
  });
  svg += text(cx, cy, "C");
  svg += `</svg>`;
  return svg;
}
function co2Diagram() {
  const w = 400, h = 160;
  const c = 200, o1 = 90, o2 = 310, y = 80;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(o1, y, 36);
  svg += circle(c, y, 36);
  svg += circle(o2, y, 36);
  svg += text(o1, y, "O");
  svg += text(c, y, "C");
  svg += text(o2, y, "O");
  for (let i of [-8, 8]) {
    svg += bondPair(o1, y + i, c, y + i, "dot", "cross");
    svg += bondPair(c, y + i, o2, y + i, "cross", "dot");
  }
  svg += lonePair(o1, y, 180, "dot");
  svg += lonePair(o1, y, 90, "dot");
  svg += lonePair(o2, y, 0, "dot");
  svg += lonePair(o2, y, 270, "dot");
  svg += `</svg>`;
  return svg;
}
function h2sDiagram() {
  const w = 340, h = 220;
  const sx = 170, sy = 100;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(sx, sy, 36);
  svg += circle(100, 160, 28);
  svg += circle(240, 160, 28);
  svg += text(sx, sy, "S");
  svg += text(100, 160, "H");
  svg += text(240, 160, "H");
  svg += bondPair(sx, sy, 100, 160, "cross", "dot");
  svg += bondPair(sx, sy, 240, 160, "cross", "dot");
  svg += lonePair(sx, sy, -50, "cross");
  svg += lonePair(sx, sy, -130, "cross");
  svg += `</svg>`;
  return svg;
}
function etheneDiagram() {
  const w = 380, h = 220;
  const c1 = 140, c2 = 240, y = 110;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(c1, y, 32);
  svg += circle(c2, y, 32);
  svg += text(c1, y, "C");
  svg += text(c2, y, "C");
  for (let i of [-9, 9]) svg += bondPair(c1, y + i, c2, y + i, "cross", "dot");
  const hs = [{ x: 70, y: 60, from: c1 }, { x: 70, y: 160, from: c1 }, { x: 310, y: 60, from: c2 }, { x: 310, y: 160, from: c2 }];
  hs.forEach(h => {
    svg += circle(h.x, h.y, 24);
    svg += text(h.x, h.y, "H");
    svg += bondPair(h.from, y, h.x, h.y, "cross", "dot");
  });
  svg += `</svg>`;
  return svg;
}
function ethyneDiagram() {
  const w = 380, h = 140;
  const c1 = 140, c2 = 240, y = 70;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(c1, y, 32);
  svg += circle(c2, y, 32);
  svg += text(c1, y, "C");
  svg += text(c2, y, "C");
  for (let i of [-12, 0, 12]) svg += bondPair(c1, y + i, c2, y + i, "cross", "dot");
  svg += circle(60, y, 24);
  svg += circle(320, y, 24);
  svg += text(60, y, "H");
  svg += text(320, y, "H");
  svg += bondPair(c1, y, 60, y, "cross", "dot");
  svg += bondPair(c2, y, 320, y, "cross", "dot");
  svg += `</svg>`;
  return svg;
}
function ionicPair(metal, nonmetal, metalValence, nonmetalValence) {
  const w = 380, h = 200;
  const mx = 110, nx = 270, y = 100;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(mx, y, 40, "rgba(59,130,246,0.15)", "#60a5fa");
  svg += text(mx, y - 8, metal);
  svg += text(mx, y + 18, metal === "Na" || metal === "K" ? "1+" : "2+", 13, "500", "#93c5fd");
  svg += circle(nx, y, 40, "rgba(248,113,113,0.12)", "#f87171");
  svg += text(nx, y - 8, nonmetal);
  svg += text(nx, y + 18, nonmetal === "Cl" || nonmetal === "Br" ? "1−" : "2−", 13, "500", "#fca5a5");
  for (let i = 0; i < metalValence; i++) svg += electron(mx + 48, y - 20 + i * 18, "dot");
  for (let i = 0; i < 8; i++) {
    const ang = (i * 45 - 90) * Math.PI / 180;
    svg += electron(nx + Math.cos(ang) * 32, y + Math.sin(ang) * 32, i < nonmetalValence ? "cross" : "dot");
  }
  svg += text(190, 30, "electron transfer", 12, "500", "#8b9bb0");
  svg += `</svg>`;
  return svg;
}
function ionicCaCl2() {
  const w = 420, h = 200;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(90, 100, 38, "rgba(59,130,246,0.15)", "#60a5fa");
  svg += text(90, 92, "Ca");
  svg += text(90, 114, "2+", 13, "500", "#93c5fd");
  svg += circle(220, 70, 34, "rgba(248,113,113,0.12)", "#f87171");
  svg += text(220, 64, "Cl");
  svg += text(220, 84, "1−", 12, "500", "#fca5a5");
  svg += circle(220, 140, 34, "rgba(248,113,113,0.12)", "#f87171");
  svg += text(220, 134, "Cl");
  svg += text(220, 154, "1−", 12, "500", "#fca5a5");
  for (let i = 0; i < 8; i++) {
    const ang = (i * 45) * Math.PI / 180;
    svg += electron(220 + Math.cos(ang) * 28, 70 + Math.sin(ang) * 28, "cross");
    svg += electron(220 + Math.cos(ang) * 28, 140 + Math.sin(ang) * 28, "cross");
  }
  svg += text(340, 100, "Ca²⁺ + 2Cl⁻", 14, "500", "#8b9bb0");
  svg += `</svg>`;
  return svg;
}
function ionicNa2O() {
  const w = 420, h = 200;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(80, 70, 34, "rgba(59,130,246,0.15)", "#60a5fa");
  svg += text(80, 64, "Na");
  svg += text(80, 84, "1+", 12, "500", "#93c5fd");
  svg += circle(80, 140, 34, "rgba(59,130,246,0.15)", "#60a5fa");
  svg += text(80, 134, "Na");
  svg += text(80, 154, "1+", 12, "500", "#93c5fd");
  svg += circle(230, 105, 40, "rgba(248,113,113,0.12)", "#f87171");
  svg += text(230, 97, "O");
  svg += text(230, 119, "2−", 13, "500", "#fca5a5");
  for (let i = 0; i < 8; i++) {
    const ang = (i * 45 - 90) * Math.PI / 180;
    svg += electron(230 + Math.cos(ang) * 32, 105 + Math.sin(ang) * 32, "cross");
  }
  svg += text(340, 105, "2Na⁺ + O²⁻", 14, "500", "#8b9bb0");
  svg += `</svg>`;
  return svg;
}
function ammoniumDiagram() {
  const w = 340, h = 260;
  const nx = 170, ny = 120;
  const hs = [{ x: 90, y: 70 }, { x: 250, y: 70 }, { x: 90, y: 180 }, { x: 250, y: 180 }];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(nx, ny, 36);
  hs.forEach(h => {
    svg += circle(h.x, h.y, 24);
    svg += text(h.x, h.y, "H");
    svg += bondPair(nx, ny, h.x, h.y, "cross", "dot");
  });
  svg += text(nx, ny, "N");
  svg += text(170, 30, "NH₄⁺", 16, "600", "#fbbf24");
  svg += `</svg>`;
  return svg;
}
function hydroxideDiagram() {
  const w = 280, h = 180;
  const ox = 140, oy = 90;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(ox, oy, 38);
  svg += circle(210, 90, 28);
  svg += text(ox, oy, "O");
  svg += text(210, 90, "H");
  svg += bondPair(ox, oy, 210, 90, "cross", "dot");
  svg += lonePair(ox, oy, 180, "cross");
  svg += lonePair(ox, oy, 90, "cross");
  svg += lonePair(ox, oy, -90, "cross");
  svg += text(140, 30, "OH⁻", 16, "600", "#fbbf24");
  svg += `</svg>`;
  return svg;
}
function sulfateDiagram() {
  const w = 360, h = 280;
  const sx = 180, sy = 140;
  const os = [{ x: 180, y: 50 }, { x: 180, y: 230 }, { x: 70, y: 140 }, { x: 290, y: 140 }];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += circle(sx, sy, 34);
  svg += text(sx, sy, "S");
  os.forEach(o => {
    svg += circle(o.x, o.y, 30);
    svg += text(o.x, o.y, "O");
    svg += bondPair(sx, sy, o.x, o.y, "cross", "dot");
  });
  os.forEach((o, i) => {
    const angles = [90, -90, 180, 0];
    svg += lonePair(o.x, o.y, angles[i], "dot");
    svg += lonePair(o.x, o.y, angles[i] + 40, "dot");
  });
  svg += text(180, 20, "SO₄²⁻", 16, "600", "#fbbf24");
  svg += `</svg>`;
  return svg;
}

function generateDiagram(key) {
  const data = DIAGRAM_DATA[key];
  if (!data) return null;
  return { name: data.name, type: data.type, description: data.description, svg: data.svg() };
}
