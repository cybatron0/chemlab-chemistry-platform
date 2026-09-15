// ChemLab Main Application
let currentSection = 'periodic';
let selectedReactants = [null, null];
let currentReaction = null;
let xp = parseInt(localStorage.getItem('chemlab-xp') || '0');

// Build a unified list of selectable species: every element + useful compounds
function buildSelectableSpecies() {
  const list = [];
  ELEMENTS.forEach(el => {
    list.push({ id: el.symbol, label: `${el.name} (${el.symbol})`, type: 'element', el });
  });
  // Common compounds that appear in the reaction database
  const compounds = [
    { id: 'HCl', label: 'Hydrochloric acid (HCl)' },
    { id: 'NaOH', label: 'Sodium hydroxide (NaOH)' },
    { id: 'H2SO4', label: 'Sulfuric acid (H₂SO₄)' },
    { id: 'AgNO3', label: 'Silver nitrate (AgNO₃)' },
    { id: 'NaCl', label: 'Sodium chloride (NaCl)' },
    { id: 'CaCO3', label: 'Calcium carbonate (CaCO₃)' },
    { id: 'H2O', label: 'Water (H₂O)' },
    { id: 'CuO', label: 'Copper(II) oxide (CuO)' },
    { id: 'NH3', label: 'Ammonia (NH₃)' },
    { id: 'PbNO3', label: 'Lead(II) nitrate (Pb(NO₃)₂)' },
    { id: 'KI', label: 'Potassium iodide (KI)' },
    { id: 'Cl2', label: 'Chlorine (Cl₂)' },
    { id: 'O2', label: 'Oxygen (O₂)' },
    { id: 'H2', label: 'Hydrogen (H₂)' },
    { id: 'CH4', label: 'Methane (CH₄)' }
  ];
  compounds.forEach(c => list.push({ ...c, type: 'compound' }));
  return list;
}
const SELECTABLE = buildSelectableSpecies();

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initPeriodicTable();
  initSimulator();
  initLessons();
  initGlossary();
  updateXP();
});

function initTheme() {
  const saved = localStorage.getItem('chemlab-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-toggle');
  btn.setAttribute('aria-label', saved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('chemlab-theme', next);
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const section = btn.dataset.section;
      document.getElementById(`section-${section}`).classList.add('active');
      currentSection = section;
    });
  });
}

function initPeriodicTable() {
  const table = document.getElementById('periodic-table');
  const search = document.getElementById('element-search');
  const catFilter = document.getElementById('category-filter');
  const legend = document.getElementById('category-legend');

  Object.entries(CATEGORIES).forEach(([key, name]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-swatch ${key}" aria-hidden="true"></span> ${name}`;
    legend.appendChild(item);
  });

  for (let row = 1; row <= 7; row++) {
    for (let col = 1; col <= 18; col++) {
      const empty = document.createElement('div');
      empty.className = 'element-empty';
      empty.style.gridColumn = col;
      empty.style.gridRow = row;
      empty.setAttribute('aria-hidden', 'true');
      table.appendChild(empty);
    }
  }

  const specialPositions = { H: {col:1, row:1}, He: {col:18, row:1} };

  ELEMENTS.forEach(el => {
    let col = el.group;
    let row = el.period;
    if (specialPositions[el.symbol]) {
      col = specialPositions[el.symbol].col;
      row = specialPositions[el.symbol].row;
    }
    if (!col || !row || col < 1 || col > 18 || row < 1 || row > 7) return;

    const cell = document.createElement('div');
    cell.className = `element ${el.category}`;
    cell.dataset.symbol = el.symbol;
    cell.style.gridColumn = col;
    cell.style.gridRow = row;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `${el.name}, atomic number ${el.num}`);
    cell.innerHTML = `<span class="number">${el.num}</span><span class="symbol">${el.symbol}</span><span class="mass">${el.mass.toFixed(1)}</span>`;
    cell.addEventListener('click', () => showElementDetail(el));
    cell.addEventListener('mouseenter', () => showElementDetail(el));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showElementDetail(el); }
    });
    table.appendChild(cell);
  });

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    document.querySelectorAll('.element').forEach(cell => {
      const el = ELEMENTS.find(e => e.symbol === cell.dataset.symbol);
      if (!el) return;
      const match = !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.num).includes(q);
      cell.style.display = match ? '' : 'none';
    });
  });

  catFilter.addEventListener('change', () => {
    const cat = catFilter.value;
    document.querySelectorAll('.element').forEach(cell => {
      if (cat === 'all' || cell.classList.contains(cat)) {
        cell.style.opacity = '1';
        cell.style.pointerEvents = '';
      } else {
        cell.style.opacity = '0.2';
        cell.style.pointerEvents = 'none';
      }
    });
  });
}

function showElementDetail(el) {
  const detail = document.getElementById('element-detail');
  detail.innerHTML = `
    <div class="detail-header">
      <div class="detail-symbol ${el.category}" aria-hidden="true">${el.symbol}</div>
      <div>
        <div class="detail-name">${el.name}</div>
        <div style="color:var(--text-muted);font-size:0.9rem;">${CATEGORIES[el.category] || el.category}</div>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-row"><span>Atomic Number</span><span>${el.num}</span></div>
      <div class="detail-row"><span>Atomic Mass</span><span>${el.mass}</span></div>
      <div class="detail-row"><span>Electron Config</span><span style="font-family:monospace">${el.config}</span></div>
      <div class="detail-row"><span>Group / Period</span><span>${el.group} / ${el.period}</span></div>
      <div class="detail-row"><span>Block</span><span>${el.block}-block</span></div>
      <div class="detail-row"><span>State (RT)</span><span>${el.state}</span></div>
      <div class="detail-row"><span>Discovered</span><span>${el.discovered}</span></div>
      <div class="detail-row"><span>Electronegativity</span><span>${el.electronegativity ?? '—'}</span></div>
      <div class="detail-row"><span>Atomic Radius (pm)</span><span>${el.atomicRadius ?? '—'}</span></div>
      <div class="detail-row"><span>Ionization Energy</span><span>${el.ionizationEnergy ?? '—'} kJ/mol</span></div>
    </div>
    <div style="margin-top:1rem;">
      <strong>Common Uses</strong>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.35rem;">${el.uses}</p>
    </div>
  `;
}

function initSimulator() {
  const list = document.getElementById('reactant-list');
  const search = document.getElementById('reactant-search');

  function renderList(filter = '') {
    const q = filter.toLowerCase().trim();
    list.innerHTML = '';
    SELECTABLE.filter(s => !q || s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      .slice(0, 80)
      .forEach(s => {
        const item = document.createElement('div');
        item.className = 'reactant-item';
        item.textContent = s.label;
        item.dataset.id = s.id;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.addEventListener('click', () => addToChamber(s.id, s.label));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addToChamber(s.id, s.label); }
        });
        list.appendChild(item);
      });
  }
  renderList();
  search.addEventListener('input', () => renderList(search.value));

  document.getElementById('run-reaction').addEventListener('click', runReaction);
  document.getElementById('clear-chamber').addEventListener('click', clearChamber);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (currentReaction) renderReactionResult(currentReaction, btn.dataset.mode);
    });
  });
}

function addToChamber(id, label) {
  if (!selectedReactants[0]) {
    selectedReactants[0] = id;
    updateSlot(0, label);
  } else if (!selectedReactants[1]) {
    selectedReactants[1] = id;
    updateSlot(1, label);
  } else {
    selectedReactants[1] = id;
    updateSlot(1, label);
  }
  document.getElementById('run-reaction').disabled = !(selectedReactants[0] && selectedReactants[1]);
}

function updateSlot(index, label) {
  const slots = document.querySelectorAll('.slot');
  slots[index].textContent = label;
  slots[index].classList.add('filled');
}

function clearChamber() {
  selectedReactants = [null, null];
  document.querySelectorAll('.slot').forEach((s) => {
    s.textContent = 'Select reactant';
    s.classList.remove('filled');
  });
  document.getElementById('run-reaction').disabled = true;
  document.getElementById('reaction-result').innerHTML = `<div class="result-placeholder"><p>Select two reactants and click Run Reaction</p></div>`;
  document.getElementById('result-modes').style.display = 'none';
  currentReaction = null;
}

// ---------- Smart reaction engine ----------
function getElement(id) {
  return ELEMENTS.find(e => e.symbol === id) || null;
}

function generateReaction(a, b) {
  // 1. Exact match from curated database
  const curated = REACTIONS.find(r => {
    const set = new Set(r.reactants);
    return set.has(a) && set.has(b) && r.reactants.length === 2;
  }) || REACTIONS.find(r => r.reactants.length === 1 && (r.reactants[0] === a || r.reactants[0] === b));
  if (curated) return curated;

  const elA = getElement(a);
  const elB = getElement(b);

  // 2. Simple ionic synthesis: Group 1/2 metal + Group 16/17 non-metal
  if (elA && elB) {
    const metal = [elA, elB].find(e => e.category === 'alkali-metal' || e.category === 'alkaline-earth');
    const nonmetal = [elA, elB].find(e => e.category === 'halogen' || e.category === 'nonmetal');
    if (metal && nonmetal && metal !== nonmetal) {
      const formula = metal.symbol + nonmetal.symbol; // simplified (NaCl style)
      return {
        id: `${metal.symbol}-${nonmetal.symbol}`,
        reactants: [metal.symbol, nonmetal.symbol],
        products: [formula],
        equation: `${metal.symbol} + ${nonmetal.symbol} → ${formula}`,
        type: 'Ionic Synthesis (predicted)',
        explanation: `${metal.name} (a reactive metal) transfers electrons to ${nonmetal.name}, forming an ionic compound. This is a typical Group ${metal.group} + Group ${nonmetal.group} reaction.`,
        realWorld: `Often vigorous, exothermic, and may produce light or heat. The product is usually a crystalline ionic solid.`,
        safety: 'Reactive metals and halogens can be hazardous. Use appropriate precautions in a real lab.',
        visual: `Metal atoms lose outer electrons; non-metal atoms gain them to achieve noble-gas configurations.`,
        metal, nonmetal, isPredicted: true
      };
    }
  }

  // 3. Fallback – no significant reaction predicted
  return null;
}

function runReaction() {
  const [a, b] = selectedReactants;
  const match = generateReaction(a, b);

  const resultEl = document.getElementById('reaction-result');
  document.getElementById('result-modes').style.display = 'flex';

  if (match) {
    currentReaction = match;
    renderReactionResult(match, 'equation');
    addXP(15);
  } else {
    currentReaction = null;
    resultEl.innerHTML = `<div class="result-content"><h3>No Significant Reaction Predicted</h3>
      <p>Under ordinary conditions, <strong>${a}</strong> and <strong>${b}</strong> do not form a simple binary ionic compound or match a curated reaction in the database.</p>
      <p style="margin-top:0.75rem;font-size:0.9rem;color:var(--text-muted);">Try pairs such as Na + Cl, Mg + O, HCl + NaOH, or Zn + HCl. You can also select any two elements from the searchable list.</p></div>`;
  }
}

// ---------- Dot-and-cross diagram generator ----------
function buildDotCross(rxn) {
  if (!rxn.metal || !rxn.nonmetal) {
    // Try to recover from curated reactions
    const ids = rxn.reactants || [];
    const metal = ids.map(getElement).find(e => e && (e.category === 'alkali-metal' || e.category === 'alkaline-earth'));
    const nonmetal = ids.map(getElement).find(e => e && (e.category === 'halogen' || e.category === 'nonmetal'));
    if (metal && nonmetal) {
      rxn.metal = metal;
      rxn.nonmetal = nonmetal;
    } else {
      return `<p style="color:var(--text-muted)">Dot-and-cross diagrams are shown for simple ionic compounds formed between Group 1/2 metals and Group 16/17 non-metals. Select such a pair (e.g. Na + Cl, Mg + O) to see the diagram.</p>`;
    }
  }

  const m = rxn.metal;
  const n = rxn.nonmetal;
  // Outer electrons (simplified)
  const metalOuter = m.group <= 2 ? m.group : 1;
  const nonmetalNeed = n.group === 17 ? 1 : (n.group === 16 ? 2 : 1);

  // Simple text/SVG-style representation
  let html = `<div class="dotcross">
    <h3>Dot-and-Cross Diagram</h3>
    <p style="margin-bottom:1rem;color:var(--text-muted);font-size:0.95rem;">
      ${m.name} loses its outer electron(s); ${n.name} gains electron(s) to achieve a full outer shell.
    </p>
    <div class="dotcross-grid">
      <div class="dotcross-atom metal">
        <div class="atom-symbol">${m.symbol}</div>
        <div class="electrons">`;
  for (let i = 0; i < metalOuter; i++) html += `<span class="dot">•</span>`;
  html += `</div>
        <div class="atom-label">${m.name}<br><small>loses ${metalOuter} e⁻</small></div>
      </div>
      <div class="arrow">→</div>
      <div class="dotcross-atom nonmetal">
        <div class="atom-symbol">${n.symbol}</div>
        <div class="electrons">`;
  // Show filled shell + the gained electron as a cross
  for (let i = 0; i < 7; i++) html += `<span class="dot">•</span>`;
  for (let i = 0; i < nonmetalNeed; i++) html += `<span class="cross">×</span>`;
  html += `</div>
        <div class="atom-label">${n.name}<br><small>gains ${nonmetalNeed} e⁻</small></div>
      </div>
    </div>
    <div class="dotcross-result">
      <strong>Result:</strong> ${m.symbol}<sup>${metalOuter === 1 ? '+' : metalOuter + '+'}</sup> and ${n.symbol}<sup>${nonmetalNeed === 1 ? '−' : nonmetalNeed + '−'}</sup> form an ionic lattice.
    </div>
    <p style="margin-top:1rem;font-size:0.9rem;color:var(--text-muted);">
      Dots (•) represent electrons originally belonging to the metal; crosses (×) represent electrons originally belonging to the non-metal (standard convention).
    </p>
  </div>`;
  return html;
}

function renderReactionResult(rxn, mode) {
  const el = document.getElementById('reaction-result');
  let html = `<div class="result-content">`;
  if (mode === 'equation') {
    html += `<h3>${rxn.type}</h3><div class="equation">${rxn.equation}</div><p>${rxn.explanation}</p>`;
    if (rxn.isPredicted) html += `<p style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-muted);">Predicted from periodic trends — always verify with a curated source for quantitative work.</p>`;
  } else if (mode === 'realworld') {
    html += `<h3>What You Would Observe</h3><p>${rxn.realWorld}</p>`;
  } else if (mode === 'visual') {
    html += `<h3>Atomic / Visual View</h3><p>${rxn.visual}</p>`;
  } else if (mode === 'dotcross') {
    html += buildDotCross(rxn);
  }
  if (rxn.safety) html += `<div class="safety-note"><strong>Safety:</strong> ${rxn.safety}</div>`;
  html += `</div>`;
  el.innerHTML = html;
}

// ---------- Longer, richer lessons ----------
const MODULES = [
  {
    id: 'atomic',
    title: 'Atomic Structure',
    desc: 'Protons, neutrons, electrons, isotopes, electron configuration, quantum numbers',
    content: `
      <p>Atoms are the basic building blocks of matter. Each atom consists of a tiny, dense <strong>nucleus</strong> containing positively charged protons and neutral neutrons, surrounded by a cloud of negatively charged electrons.</p>
      <h4>Key quantities</h4>
      <ul>
        <li><strong>Atomic number (Z)</strong> = number of protons. This defines the element.</li>
        <li><strong>Mass number (A)</strong> = protons + neutrons.</li>
        <li><strong>Isotopes</strong> of an element have the same Z but different numbers of neutrons (different A).</li>
      </ul>
      <h4>Electron configuration</h4>
      <p>Electrons occupy orbitals according to three rules:</p>
      <ol>
        <li><strong>Aufbau principle</strong> – fill lowest energy orbitals first.</li>
        <li><strong>Pauli exclusion principle</strong> – maximum two electrons per orbital, opposite spins.</li>
        <li><strong>Hund’s rule</strong> – unpaired electrons occupy degenerate orbitals singly before pairing.</li>
      </ol>
      <p>The four quantum numbers (n, ℓ, m<sub>ℓ</sub>, m<sub>s</sub>) completely describe an electron in an atom. Understanding electron configuration is essential for predicting bonding and reactivity.</p>
      <h4>Worked example</h4>
      <p>Write the electron configuration of oxygen (Z = 8): 1s² 2s² 2p⁴. It needs two more electrons to complete the 2p subshell, explaining why oxygen forms O²⁻ ions or two covalent bonds.</p>
    `
  },
  {
    id: 'trends',
    title: 'Periodic Trends',
    desc: 'Atomic radius, ionization energy, electronegativity, electron affinity, reactivity patterns',
    content: `
      <p>The periodic table is arranged so that elements with similar outer-electron configurations lie in the same group. This produces clear trends.</p>
      <h4>Across a period (left → right)</h4>
      <ul>
        <li>Atomic radius <strong>decreases</strong> (nuclear charge increases while shielding stays roughly constant).</li>
        <li>First ionization energy and electronegativity <strong>increase</strong>.</li>
      </ul>
      <h4>Down a group</h4>
      <ul>
        <li>Atomic radius <strong>increases</strong> (extra electron shells).</li>
        <li>Ionization energy and electronegativity <strong>decrease</strong>.</li>
      </ul>
      <p>These trends explain reactivity patterns: alkali metals become more reactive down the group because the outer electron is easier to lose; non-metals in Group 17 become less reactive down the group because the attraction for an extra electron weakens.</p>
      <h4>Key takeaway</h4>
      <p>Always relate observed reactivity back to atomic size and effective nuclear charge. This is one of the most powerful predictive tools in chemistry.</p>
    `
  },
  {
    id: 'bonding',
    title: 'Chemical Bonding',
    desc: 'Ionic, covalent, metallic bonds, polarity, intermolecular forces',
    content: `
      <p>Atoms form chemical bonds to achieve more stable electron configurations (usually a full outer shell).</p>
      <h4>Ionic bonding</h4>
      <p>Transfer of electrons from a metal to a non-metal. The resulting oppositely charged ions are held by strong electrostatic attraction in a giant lattice. High melting points, conduct when molten or dissolved.</p>
      <h4>Covalent bonding</h4>
      <p>Sharing of electron pairs between non-metals. Can be single, double or triple. Molecules may be polar if the atoms have different electronegativities.</p>
      <h4>Metallic bonding</h4>
      <p>A lattice of positive ions surrounded by a sea of delocalised electrons. Explains conductivity, malleability and high melting points of metals.</p>
      <h4>Intermolecular forces</h4>
      <p>London dispersion < dipole–dipole < hydrogen bonding. These determine boiling/melting points of molecular substances and solubility.</p>
      <p>Use the Reaction Simulator’s <strong>Dot & Cross</strong> mode to visualise electron transfer for simple ionic compounds.</p>
    `
  },
  {
    id: 'stoich',
    title: 'Stoichiometry',
    desc: 'Mole concept, balancing equations, limiting reagents, theoretical & percentage yield',
    content: `
      <p>Stoichiometry is the quantitative relationship between reactants and products in a chemical reaction.</p>
      <h4>The mole</h4>
      <p>1 mole = 6.022 × 10²³ particles (Avogadro’s number). Molar mass (g mol⁻¹) converts between mass and moles: <code>n = m / M</code>.</p>
      <h4>Balanced equations</h4>
      <p>A balanced equation gives the mole ratios. Always start quantitative calculations from the balanced equation.</p>
      <h4>Limiting reagent</h4>
      <p>The reactant that is completely consumed first determines the maximum amount of product. Identify it by comparing the available moles with the stoichiometric requirement.</p>
      <h4>Percentage yield</h4>
      <p>% yield = (actual mass of product / theoretical mass) × 100%. Losses occur through incomplete reaction, side reactions and purification steps.</p>
      <p>Practice with the Tools section calculators and then apply the same logic to any balanced equation you meet.</p>
    `
  },
  {
    id: 'states',
    title: 'States of Matter',
    desc: 'Gases, liquids, solids, phase changes, ideal gas law, kinetic molecular theory',
    content: `
      <p>Matter exists in solid, liquid and gaseous states under ordinary conditions. Plasma and supercritical fluids appear under extreme conditions.</p>
      <h4>Kinetic molecular theory</h4>
      <p>Particles are in continuous random motion. Temperature is a measure of average kinetic energy. Collisions are elastic. Attractive forces become significant in liquids and solids.</p>
      <h4>Ideal gas law</h4>
      <p><code>PV = nRT</code>. Useful approximations at moderate pressures and temperatures. Real gases deviate at high pressure / low temperature.</p>
      <h4>Phase changes</h4>
      <p>Melting, boiling, sublimation and their reverse processes involve energy changes (enthalpy of fusion/vaporisation) without a change in temperature while the transition is occurring.</p>
    `
  },
  {
    id: 'thermo',
    title: 'Thermodynamics',
    desc: 'Enthalpy, entropy, Gibbs free energy, endothermic/exothermic, spontaneity',
    content: `
      <p>Thermodynamics tells us whether a process can occur spontaneously and how much energy is exchanged.</p>
      <h4>Enthalpy (H)</h4>
      <p>ΔH < 0 is exothermic (heat released). ΔH > 0 is endothermic. Enthalpy changes are measured by calorimetry or calculated from bond energies / Hess’s law / standard enthalpies of formation.</p>
      <h4>Entropy (S)</h4>
      <p>A measure of disorder / number of accessible microstates. The Second Law states that the entropy of the universe increases for spontaneous processes.</p>
      <h4>Gibbs free energy</h4>
      <p>ΔG = ΔH − TΔS. A process is spontaneous (product-favoured) when ΔG < 0. Temperature can reverse the sign of ΔG when ΔH and ΔS have the same sign.</p>
    `
  },
  {
    id: 'kinetics',
    title: 'Chemical Kinetics',
    desc: 'Reaction rates, rate laws, activation energy, catalysts, collision theory',
    content: `
      <p>Kinetics studies how fast reactions occur and the factors that affect rate.</p>
      <h4>Collision theory</h4>
      <p>Particles must collide with sufficient energy (activation energy, E<sub>a</sub>) and correct orientation. Rate increases with concentration, temperature, surface area and presence of a catalyst.</p>
      <h4>Rate laws</h4>
      <p>Determined experimentally. The order of reaction is not necessarily related to the stoichiometric coefficients.</p>
      <h4>Catalysts</h4>
      <p>Provide an alternative pathway with lower E<sub>a</sub>. They are not consumed in the overall reaction. Enzymes are biological catalysts.</p>
    `
  },
  {
    id: 'equilibrium',
    title: 'Chemical Equilibrium',
    desc: 'Dynamic equilibrium, Le Chatelier’s principle, equilibrium constants Kc and Kp',
    content: `
      <p>At equilibrium the forward and reverse rates are equal and macroscopic concentrations remain constant (dynamic equilibrium).</p>
      <h4>Equilibrium constant</h4>
      <p>K<sub>c</sub> = [products] / [reactants] (raised to stoichiometric powers). A large K means products are favoured.</p>
      <h4>Le Chatelier’s principle</h4>
      <p>If a system at equilibrium is subjected to a change in concentration, pressure or temperature, the system shifts to counteract the change. This is the key tool for predicting the effect of industrial conditions on yield.</p>
    `
  },
  {
    id: 'acids',
    title: 'Acids & Bases',
    desc: 'pH scale, strong/weak acids & bases, buffers, titration curves, Ka and Kb',
    content: `
      <p>Acids and bases can be defined by Arrhenius, Brønsted–Lowry or Lewis theories. The Brønsted–Lowry definition (proton donors/acceptors) is most useful for aqueous chemistry.</p>
      <h4>pH</h4>
      <p>pH = −log<sub>10</sub>[H⁺]. Strong acids and bases fully dissociate; weak ones establish an equilibrium characterised by K<sub>a</sub> or K<sub>b</sub>.</p>
      <h4>Buffers</h4>
      <p>A buffer resists changes in pH and typically consists of a weak acid + its conjugate base (or weak base + conjugate acid). The Henderson–Hasselbalch equation is used for calculations.</p>
      <h4>Titrations</h4>
      <p>The shape of a titration curve and the choice of indicator depend on the strengths of the acid and base involved.</p>
    `
  },
  {
    id: 'redox',
    title: 'Redox & Electrochemistry',
    desc: 'Oxidation numbers, balancing redox, galvanic cells, electrolysis, standard potentials',
    content: `
      <p>Oxidation is loss of electrons (increase in oxidation number); reduction is gain of electrons. Redox reactions can be split into half-equations.</p>
      <h4>Galvanic (voltaic) cells</h4>
      <p>Spontaneous redox reactions produce electricity. The cell potential E°<sub>cell</sub> = E°<sub>reduction</sub> − E°<sub>oxidation</sub>. A positive E° indicates a spontaneous reaction under standard conditions.</p>
      <h4>Electrolysis</h4>
      <p>Electrical energy is used to drive non-spontaneous reactions. Used in extraction of metals, electroplating and production of chlorine and sodium hydroxide.</p>
    `
  },
  {
    id: 'organic',
    title: 'Organic Chemistry Basics',
    desc: 'Hydrocarbons, functional groups, isomerism, nomenclature, common reaction types',
    content: `
      <p>Organic chemistry is the study of carbon compounds. Carbon’s ability to form four strong covalent bonds and to catenate produces an enormous variety of structures.</p>
      <h4>Functional groups</h4>
      <p>–OH (alcohol), C=O (carbonyl), –COOH (carboxylic acid), –NH₂ (amine), etc. The functional group largely determines the physical and chemical properties.</p>
      <h4>Isomerism</h4>
      <p>Structural isomers have the same molecular formula but different connectivity. Stereoisomers have the same connectivity but different spatial arrangement.</p>
      <h4>Common reaction types</h4>
      <p>Substitution, addition, elimination, oxidation and condensation. Learning the characteristic reactions of each functional group is the heart of introductory organic chemistry.</p>
    `
  },
  {
    id: 'nuclear',
    title: 'Nuclear Chemistry',
    desc: 'Radioactivity, half-life, fission, fusion, nuclear equations, applications',
    content: `
      <p>Nuclear chemistry deals with changes in the nucleus rather than the electron cloud.</p>
      <h4>Radioactive decay</h4>
      <p>α (helium nucleus), β (electron or positron) and γ (high-energy photon) emission. Nuclear equations must conserve both mass number and atomic number.</p>
      <h4>Half-life</h4>
      <p>The time required for half the radioactive nuclei in a sample to decay. Used in radiometric dating and nuclear medicine.</p>
      <h4>Fission and fusion</h4>
      <p>Fission splits heavy nuclei (nuclear power, atomic weapons). Fusion combines light nuclei (energy source of stars, experimental fusion reactors).</p>
    `
  }
];

function initLessons() {
  const grid = document.getElementById('modules-grid');
  MODULES.forEach(m => {
    const card = document.createElement('div');
    card.className = 'module-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `<h3>${m.title}</h3><p>${m.desc}</p><div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>`;
    card.addEventListener('click', () => openModule(m));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModule(m); }
    });
    grid.appendChild(card);
  });
}

function openModule(m) {
  const content = document.getElementById('lesson-content');
  content.style.display = 'block';
  content.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem;margin-top:1.5rem;">
      <h2>${m.title}</h2>
      <p style="color:var(--text-muted);margin:0.5rem 0 1rem;">${m.desc}</p>
      <div class="lesson-body" style="line-height:1.75; margin-top:1rem; font-size:1.05rem;">
        ${m.content}
      </div>
      <p style="margin-top:1.5rem; font-size:0.9rem; color:var(--text-muted);">
        <strong>Next steps:</strong> Open the Reaction Simulator, try related element pairs, and use the Dot & Cross view. The Tools section helps with quantitative practice.
      </p>
      <button class="secondary-btn" style="margin-top:1rem;" onclick="document.getElementById('lesson-content').style.display='none'">Close</button>
    </div>
  `;
  content.scrollIntoView({ behavior: 'smooth' });
  addXP(10);
}

const GLOSSARY = [
  { term: "Acid", def: "A substance that donates protons (H⁺) or accepts electrons. Increases [H⁺] in solution." },
  { term: "Base", def: "A substance that accepts protons or donates electron pairs. Increases [OH⁻] in solution." },
  { term: "Mole", def: "The SI unit for amount of substance. One mole contains 6.022 × 10²³ particles (Avogadro's number)." },
  { term: "Molarity (M)", def: "Concentration expressed as moles of solute per liter of solution." },
  { term: "Oxidation", def: "Loss of electrons, increase in oxidation number, or gain of oxygen / loss of hydrogen." },
  { term: "Reduction", def: "Gain of electrons, decrease in oxidation number, or loss of oxygen / gain of hydrogen." },
  { term: "Electronegativity", def: "The ability of an atom to attract shared electrons in a chemical bond." },
  { term: "Ionization Energy", def: "The energy required to remove one mole of electrons from one mole of gaseous atoms." },
  { term: "Catalyst", def: "A substance that increases the rate of a reaction without being consumed itself." },
  { term: "Equilibrium", def: "A state in which the forward and reverse reaction rates are equal and concentrations remain constant." },
  { term: "Precipitate", def: "An insoluble solid that forms when two aqueous solutions are mixed." },
  { term: "Stoichiometry", def: "The quantitative relationship between reactants and products in a chemical reaction." },
  { term: "Enthalpy", def: "A thermodynamic quantity equivalent to the total heat content of a system at constant pressure." },
  { term: "Entropy", def: "A measure of the disorder or randomness of a system." },
  { term: "Buffer", def: "A solution that resists changes in pH when small amounts of acid or base are added." },
  { term: "Dot-and-cross diagram", def: "A diagram showing the outer electrons of atoms in a molecule or ionic compound; dots and crosses distinguish the origin of each electron." }
];

function initGlossary() {
  const list = document.getElementById('glossary-list');
  const search = document.getElementById('glossary-search');
  function render(items) {
    list.innerHTML = items.map(g => `<div class="glossary-item"><h4>${g.term}</h4><p>${g.def}</p></div>`).join('');
  }
  render(GLOSSARY);
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    const filtered = GLOSSARY.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
    render(filtered);
  });
}

function calcMolarity() {
  const mol = parseFloat(document.getElementById('mol-solute').value);
  const vol = parseFloat(document.getElementById('vol-solution').value);
  if (isNaN(mol) || isNaN(vol) || vol === 0) { document.getElementById('molarity-result').textContent = 'Enter valid numbers'; return; }
  document.getElementById('molarity-result').textContent = `Molarity = ${(mol / vol).toFixed(4)} M`;
  addXP(5);
}
function calcMoles() {
  const mass = parseFloat(document.getElementById('stoich-mass').value);
  const mm = parseFloat(document.getElementById('stoich-mm').value);
  if (isNaN(mass) || isNaN(mm) || mm === 0) { document.getElementById('stoich-result').textContent = 'Enter valid numbers'; return; }
  document.getElementById('stoich-result').textContent = `Moles = ${(mass / mm).toFixed(4)} mol`;
  addXP(5);
}
function convertTemp() {
  const c = parseFloat(document.getElementById('temp-c').value);
  if (isNaN(c)) { document.getElementById('temp-result').textContent = 'Enter a number'; return; }
  document.getElementById('temp-result').textContent = `${(c + 273.15).toFixed(2)} K  |  ${(c * 9/5 + 32).toFixed(2)} °F`;
  addXP(3);
}
function calcDilution() {
  const c1 = parseFloat(document.getElementById('c1').value);
  const v1 = parseFloat(document.getElementById('v1').value);
  const c2 = parseFloat(document.getElementById('c2').value);
  if (isNaN(c1) || isNaN(v1) || isNaN(c2) || c2 === 0) { document.getElementById('dilution-result').textContent = 'Enter valid numbers'; return; }
  document.getElementById('dilution-result').textContent = `V₂ = ${((c1 * v1) / c2).toFixed(4)} (same units as V₁)`;
  addXP(5);
}
function addXP(amount) { xp += amount; localStorage.setItem('chemlab-xp', xp); updateXP(); }
function updateXP() { document.getElementById('xp-value').textContent = xp; }
