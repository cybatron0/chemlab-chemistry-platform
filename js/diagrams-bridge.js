// Enhanced Dot-and-Cross diagrams (SVG) – integrated into ChemLab
// Loaded after reactions-data.js

function _circle(cx, cy, r, stroke="#22d3ee") {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
}
function _text(x, y, t, size=16) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="600" fill="currentColor" text-anchor="middle" dominant-baseline="middle" font-family="Inter,system-ui,sans-serif">${t}</text>`;
}
function _dot(x, y) {
  return `<circle cx="${x}" cy="${y}" r="3.2" fill="#34d399"/>`;
}
function _cross(x, y) {
  const s=4;
  return `<g stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round">
    <line x1="${x-s}" y1="${y-s}" x2="${x+s}" y2="${y+s}"/>
    <line x1="${x+s}" y1="${y-s}" x2="${x-s}" y2="${y+s}"/></g>`;
}
function _bond(cx1,cy1,cx2,cy2) {
  const mx=(cx1+cx2)/2, my=(cy1+cy2)/2;
  const dx=cx2-cx1, dy=cy2-cy1, len=Math.sqrt(dx*dx+dy*dy)||1;
  const px=(-dy/len)*7, py=(dx/len)*7;
  return _dot(mx+px,my+py) + _cross(mx-px,my-py);
}
function _lone(cx,cy,ang) {
  const rad=ang*Math.PI/180, d=28;
  const dx=Math.cos(rad)*d, dy=Math.sin(rad)*d;
  const px=-Math.sin(rad)*6, py=Math.cos(rad)*6;
  return _cross(cx+dx+px,cy+dy+py) + _cross(cx+dx-px,cy+dy-py);
}

function svgWater() {
  const ox=170,oy=100, hx1=100,hy1=160, hx2=240,hy2=160;
  return `<svg width="340" height="220" viewBox="0 0 340 220" style="max-width:100%;color:var(--text)">
    ${_circle(ox,oy,36)}${_circle(hx1,hy1,28)}${_circle(hx2,hy2,28)}
    ${_text(ox,oy,"O")}${_text(hx1,hy1,"H")}${_text(hx2,hy2,"H")}
    ${_bond(ox,oy,hx1,hy1)}${_bond(ox,oy,hx2,hy2)}
    ${_lone(ox,oy,-50)}${_lone(ox,oy,-130)}
  </svg>`;
}
function svgNH3() {
  const nx=180,ny=90;
  return `<svg width="360" height="240" viewBox="0 0 360 240" style="max-width:100%;color:var(--text)">
    ${_circle(nx,ny,36)}
    ${_circle(100,160,26)}${_circle(180,190,26)}${_circle(260,160,26)}
    ${_text(nx,ny,"N")}${_text(100,160,"H")}${_text(180,190,"H")}${_text(260,160,"H")}
    ${_bond(nx,ny,100,160)}${_bond(nx,ny,180,190)}${_bond(nx,ny,260,160)}
    ${_lone(nx,ny,-90)}
  </svg>`;
}
function svgCH4() {
  const cx=180,cy=120;
  const hs=[[100,70],[260,70],[100,180],[260,180]];
  let s=`<svg width="360" height="260" viewBox="0 0 360 260" style="max-width:100%;color:var(--text)">
    ${_circle(cx,cy,36)}${_text(cx,cy,"C")}`;
  hs.forEach(([x,y])=>{ s+=`${_circle(x,y,26)}${_text(x,y,"H")}${_bond(cx,cy,x,y)}`; });
  return s+`</svg>`;
}
function svgCO2() {
  return `<svg width="400" height="160" viewBox="0 0 400 160" style="max-width:100%;color:var(--text)">
    ${_circle(90,80,36)}${_circle(200,80,36)}${_circle(310,80,36)}
    ${_text(90,80,"O")}${_text(200,80,"C")}${_text(310,80,"O")}
    ${_bond(90,72,200,72)}${_bond(90,88,200,88)}
    ${_bond(200,72,310,72)}${_bond(200,88,310,88)}
    ${_lone(90,80,180)}${_lone(90,80,90)}${_lone(310,80,0)}${_lone(310,80,270)}
  </svg>`;
}
function svgH2() {
  return `<svg width="280" height="140" viewBox="0 0 280 140" style="max-width:100%;color:var(--text)">
    ${_circle(90,70,34)}${_circle(190,70,34)}
    ${_text(90,70,"H")}${_text(190,70,"H")}
    ${_bond(90,70,190,70)}
  </svg>`;
}
function svgNaCl() {
  return `<svg width="380" height="180" viewBox="0 0 380 180" style="max-width:100%;color:var(--text)">
    <circle cx="110" cy="90" r="40" fill="rgba(59,130,246,0.15)" stroke="#60a5fa" stroke-width="2"/>
    ${_text(110,82,"Na")}${_text(110,108,"1+",13)}
    <circle cx="270" cy="90" r="40" fill="rgba(248,113,113,0.12)" stroke="#f87171" stroke-width="2"/>
    ${_text(270,82,"Cl")}${_text(270,108,"1−",13)}
    ${_dot(160,70)}${_cross(220,70)}
    <text x="190" y="30" font-size="12" fill="var(--text-muted)" text-anchor="middle">electron transfer</text>
  </svg>`;
}
function svgMgO() {
  return `<svg width="380" height="180" viewBox="0 0 380 180" style="max-width:100%;color:var(--text)">
    <circle cx="110" cy="90" r="40" fill="rgba(59,130,246,0.15)" stroke="#60a5fa" stroke-width="2"/>
    ${_text(110,82,"Mg")}${_text(110,108,"2+",13)}
    <circle cx="270" cy="90" r="40" fill="rgba(248,113,113,0.12)" stroke="#f87171" stroke-width="2"/>
    ${_text(270,82,"O")}${_text(270,108,"2−",13)}
    ${_dot(155,65)}${_dot(155,95)}${_cross(225,65)}${_cross(225,95)}
  </svg>`;
}

const SVG_DIAGRAMS = {
  H2: { name:"Hydrogen (H₂)", svg: svgH2, desc:"Two hydrogen atoms share one pair of electrons (single covalent bond)." },
  H2O: { name:"Water (H₂O)", svg: svgWater, desc:"Oxygen shares one pair with each hydrogen. Two lone pairs on oxygen. Bent shape." },
  NH3: { name:"Ammonia (NH₃)", svg: svgNH3, desc:"Nitrogen shares one pair with each of three hydrogens. One lone pair. Trigonal pyramidal." },
  CH4: { name:"Methane (CH₄)", svg: svgCH4, desc:"Carbon shares one pair with each of four hydrogens. Tetrahedral." },
  CO2: { name:"Carbon Dioxide (CO₂)", svg: svgCO2, desc:"Carbon forms two double bonds with oxygen atoms. Linear." },
  NaCl: { name:"Sodium Chloride (NaCl)", svg: svgNaCl, desc:"Sodium transfers its valence electron to chlorine → Na⁺ and Cl⁻." },
  MgO: { name:"Magnesium Oxide (MgO)", svg: svgMgO, desc:"Magnesium transfers two electrons to oxygen → Mg²⁺ and O²⁻." }
};

function getProductKey(rxn) {
  if (!rxn || !rxn.products) return null;
  const p = rxn.products[0];
  if (!p) return null;
  if (SVG_DIAGRAMS[p]) return p;
  const map = { "H2O":"H2O", "NaCl":"NaCl", "MgO":"MgO", "NH3":"NH3", "CH4":"CH4", "CO2":"CO2", "H2":"H2" };
  return map[p] || null;
}

function buildDotCrossEnhanced(rxn) {
  const key = getProductKey(rxn);
  if (key && SVG_DIAGRAMS[key]) {
    const d = SVG_DIAGRAMS[key];
    return `<div class="dotcross">
      <h3>Dot-and-Cross Diagram — ${d.name}</h3>
      <div style="display:flex;justify-content:center;margin:1rem 0;background:var(--surface2,#1a2330);border-radius:10px;padding:1rem;">
        ${d.svg()}
      </div>
      <p>${d.desc}</p>
      <p style="margin-top:0.75rem;font-size:0.85rem;color:var(--text-muted)">
        Green dots = electrons from one atom · Yellow crosses = electrons from the other atom
      </p>
    </div>`;
  }
  if (typeof buildDotCross === "function" && buildDotCross !== buildDotCrossEnhanced) {
    return buildDotCross(rxn);
  }
  return `<p style="color:var(--text-muted)">No detailed dot-and-cross diagram available for this reaction yet. Try water formation, NaCl, MgO, ammonia, methane or CO₂.</p>`;
}
