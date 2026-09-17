// Enhanced Dot-and-Cross diagrams (SVG) for the educational ChemLab
// Friendly colours suitable for secondary school students
// Falls back to the original ionic builder when no SVG is available

function _c(cx, cy, r, stroke="#4f46e5") {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="2.5"/>`;
}
function _t(x, y, t, size=16) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="600" fill="currentColor" text-anchor="middle" dominant-baseline="middle" font-family="Inter,system-ui,sans-serif">${t}</text>`;
}
function _dot(x, y) {
  return `<circle cx="${x}" cy="${y}" r="3.5" fill="#16a34a"/>`;
}
function _cross(x, y) {
  const s=4.5;
  return `<g stroke="#ca8a04" stroke-width="2" stroke-linecap="round">
    <line x1="${x-s}" y1="${y-s}" x2="${x+s}" y2="${y+s}"/>
    <line x1="${x+s}" y1="${y-s}" x2="${x-s}" y2="${y+s}"/></g>`;
}
function _bond(cx1,cy1,cx2,cy2) {
  const mx=(cx1+cx2)/2, my=(cy1+cy2)/2;
  const dx=cx2-cx1, dy=cy2-cy1, len=Math.sqrt(dx*dx+dy*dy)||1;
  const px=(-dy/len)*8, py=(dx/len)*8;
  return _dot(mx+px,my+py) + _cross(mx-px,my-py);
}
function _lone(cx,cy,ang) {
  const rad=ang*Math.PI/180, d=30;
  const dx=Math.cos(rad)*d, dy=Math.sin(rad)*d;
  const px=-Math.sin(rad)*7, py=Math.cos(rad)*7;
  return _cross(cx+dx+px,cy+dy+py) + _cross(cx+dx-px,cy+dy-py);
}

function svgWater() {
  return `<svg width="340" height="220" viewBox="0 0 340 220" style="max-width:100%;color:var(--text)">
    ${_c(170,100,36)}${_c(100,160,28)}${_c(240,160,28)}
    ${_t(170,100,"O")}${_t(100,160,"H")}${_t(240,160,"H")}
    ${_bond(170,100,100,160)}${_bond(170,100,240,160)}
    ${_lone(170,100,-50)}${_lone(170,100,-130)}
  </svg>`;
}
function svgNH3() {
  return `<svg width="360" height="240" viewBox="0 0 360 240" style="max-width:100%;color:var(--text)">
    ${_c(180,90,36)}
    ${_c(100,160,26)}${_c(180,190,26)}${_c(260,160,26)}
    ${_t(180,90,"N")}${_t(100,160,"H")}${_t(180,190,"H")}${_t(260,160,"H")}
    ${_bond(180,90,100,160)}${_bond(180,90,180,190)}${_bond(180,90,260,160)}
    ${_lone(180,90,-90)}
  </svg>`;
}
function svgCH4() {
  const hs=[[100,70],[260,70],[100,180],[260,180]];
  let s=`<svg width="360" height="260" viewBox="0 0 360 260" style="max-width:100%;color:var(--text)">
    ${_c(180,120,36)}${_t(180,120,"C")}`;
  hs.forEach(([x,y])=>{ s+=`${_c(x,y,26)}${_t(x,y,"H")}${_bond(180,120,x,y)}`; });
  return s+`</svg>`;
}
function svgCO2() {
  return `<svg width="400" height="160" viewBox="0 0 400 160" style="max-width:100%;color:var(--text)">
    ${_c(90,80,36)}${_c(200,80,36)}${_c(310,80,36)}
    ${_t(90,80,"O")}${_t(200,80,"C")}${_t(310,80,"O")}
    ${_bond(90,72,200,72)}${_bond(90,88,200,88)}
    ${_bond(200,72,310,72)}${_bond(200,88,310,88)}
    ${_lone(90,80,180)}${_lone(90,80,90)}${_lone(310,80,0)}${_lone(310,80,270)}
  </svg>`;
}
function svgH2() {
  return `<svg width="280" height="140" viewBox="0 0 280 140" style="max-width:100%;color:var(--text)">
    ${_c(90,70,34)}${_c(190,70,34)}
    ${_t(90,70,"H")}${_t(190,70,"H")}
    ${_bond(90,70,190,70)}
  </svg>`;
}
function svgNaCl() {
  return `<svg width="380" height="180" viewBox="0 0 380 180" style="max-width:100%;color:var(--text)">
    <circle cx="110" cy="90" r="40" fill="rgba(79,70,229,0.12)" stroke="#4f46e5" stroke-width="2.5"/>
    ${_t(110,82,"Na")}${_t(110,108,"1+",13)}
    <circle cx="270" cy="90" r="40" fill="rgba(220,38,38,0.1)" stroke="#dc2626" stroke-width="2.5"/>
    ${_t(270,82,"Cl")}${_t(270,108,"1−",13)}
    ${_dot(160,70)}${_cross(220,70)}
    <text x="190" y="30" font-size="13" fill="#64748b" text-anchor="middle">electron transfer</text>
  </svg>`;
}
function svgMgO() {
  return `<svg width="380" height="180" viewBox="0 0 380 180" style="max-width:100%;color:var(--text)">
    <circle cx="110" cy="90" r="40" fill="rgba(79,70,229,0.12)" stroke="#4f46e5" stroke-width="2.5"/>
    ${_t(110,82,"Mg")}${_t(110,108,"2+",13)}
    <circle cx="270" cy="90" r="40" fill="rgba(220,38,38,0.1)" stroke="#dc2626" stroke-width="2.5"/>
    ${_t(270,82,"O")}${_t(270,108,"2−",13)}
    ${_dot(155,65)}${_dot(155,95)}${_cross(225,65)}${_cross(225,95)}
  </svg>`;
}

const SVG_DIAGRAMS = {
  H2:  { name:"Hydrogen (H₂)",   svg: svgH2,  desc:"Two hydrogen atoms share one pair of electrons (single covalent bond)." },
  H2O: { name:"Water (H₂O)",     svg: svgWater, desc:"Oxygen shares one pair with each hydrogen. Two lone pairs on oxygen. Bent shape." },
  NH3: { name:"Ammonia (NH₃)",   svg: svgNH3,  desc:"Nitrogen shares one pair with each of three hydrogens. One lone pair. Trigonal pyramidal." },
  CH4: { name:"Methane (CH₄)",   svg: svgCH4,  desc:"Carbon shares one pair with each of four hydrogens. Tetrahedral." },
  CO2: { name:"Carbon Dioxide (CO₂)", svg: svgCO2, desc:"Carbon forms two double bonds with oxygen atoms. Linear." },
  NaCl:{ name:"Sodium Chloride (NaCl)", svg: svgNaCl, desc:"Sodium transfers its valence electron to chlorine → Na⁺ and Cl⁻." },
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
      <div style="display:flex;justify-content:center;margin:1rem 0;background:#f8fafc;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;">
        ${d.svg()}
      </div>
      <p>${d.desc}</p>
      <p style="margin-top:0.75rem;font-size:0.85rem;color:#64748b">
        Green dots = electrons from one atom · Yellow crosses = electrons from the other atom
      </p>
    </div>`;
  }
  if (typeof buildDotCross === "function" && buildDotCross !== buildDotCrossEnhanced) {
    return buildDotCross(rxn);
  }
  return `<p style="color:#64748b">No detailed diagram available for this reaction yet. Try water, NaCl, MgO, ammonia, methane or CO₂.</p>`;
}
