// ChemLab Main Application
let currentSection = 'periodic';
let selectedReactants = [null, null];
let currentReaction = null;
let xp = parseInt(localStorage.getItem('chemlab-xp') || '0');

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
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('chemlab-theme', next);
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
    item.innerHTML = `<span class="legend-swatch ${key}"></span> ${name}`;
    legend.appendChild(item);
  });

  const positions = {
    H:  {col:1, row:1}, He: {col:18, row:1},
    Li: {col:1, row:2}, Be: {col:2, row:2}, B: {col:13, row:2}, C: {col:14, row:2}, N: {col:15, row:2}, O: {col:16, row:2}, F: {col:17, row:2}, Ne: {col:18, row:2},
    Na: {col:1, row:3}, Mg: {col:2, row:3}, Al: {col:13, row:3}, Si: {col:14, row:3}, P: {col:15, row:3}, S: {col:16, row:3}, Cl: {col:17, row:3}, Ar: {col:18, row:3},
    K:  {col:1, row:4}, Ca: {col:2, row:4}, Sc: {col:3, row:4}, Ti: {col:4, row:4}, V: {col:5, row:4}, Cr: {col:6, row:4}, Mn: {col:7, row:4},
    Fe: {col:8, row:4}, Co: {col:9, row:4}, Ni: {col:10, row:4}, Cu: {col:11, row:4}, Zn: {col:12, row:4},
    Ga: {col:13, row:4}, Ge: {col:14, row:4}, As: {col:15, row:4}, Se: {col:16, row:4}, Br: {col:17, row:4}, Kr: {col:18, row:4},
    Rb: {col:1, row:5}, Sr: {col:2, row:5}, Ag: {col:11, row:5}, Sn: {col:14, row:5}, I: {col:17, row:5}, Xe: {col:18, row:5},
    Cs: {col:1, row:6}, Ba: {col:2, row:6}, Au: {col:11, row:6}, Hg: {col:12, row:6}, Pb: {col:14, row:6},
    U:  {col:3, row:7}
  };

  for (let row = 1; row <= 7; row++) {
    for (let col = 1; col <= 18; col++) {
      const empty = document.createElement('div');
      empty.className = 'element-empty';
      empty.style.gridColumn = col;
      empty.style.gridRow = row;
      table.appendChild(empty);
    }
  }

  ELEMENTS.forEach(el => {
    const pos = positions[el.symbol];
    if (!pos) return;
    const cell = document.createElement('div');
    cell.className = `element ${el.category}`;
    cell.dataset.symbol = el.symbol;
    cell.style.gridColumn = pos.col;
    cell.style.gridRow = pos.row;
    cell.innerHTML = `<span class="number">${el.num}</span><span class="symbol">${el.symbol}</span><span class="mass">${el.mass.toFixed(1)}</span>`;
    cell.addEventListener('click', () => showElementDetail(el));
    cell.addEventListener('mouseenter', () => showElementDetail(el));
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
      <div class="detail-symbol ${el.category}">${el.symbol}</div>
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
  REACTANT_OPTIONS.forEach(r => {
    const item = document.createElement('div');
    item.className = 'reactant-item';
    item.textContent = r.label;
    item.dataset.id = r.id;
    item.addEventListener('click', () => addToChamber(r.id, r.label));
    list.appendChild(item);
  });

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
    s.textContent = 'Drop reactant here';
    s.classList.remove('filled');
  });
  document.getElementById('run-reaction').disabled = true;
  document.getElementById('reaction-result').innerHTML = `<div class="result-placeholder"><p>Select two reactants and click Run Reaction</p></div>`;
  document.getElementById('result-modes').style.display = 'none';
  currentReaction = null;
}

function runReaction() {
  const [a, b] = selectedReactants;
  const match = REACTIONS.find(r => {
    const set = new Set(r.reactants);
    return set.has(a) && set.has(b);
  });

  const resultEl = document.getElementById('reaction-result');
  document.getElementById('result-modes').style.display = 'flex';

  if (match) {
    currentReaction = match;
    renderReactionResult(match, 'equation');
    addXP(15);
  } else {
    currentReaction = null;
    resultEl.innerHTML = `<div class="result-content"><h3>No Significant Reaction</h3><p>Under normal laboratory conditions, <strong>${a}</strong> and <strong>${b}</strong> do not react readily, or the combination is not in the current database.</p></div>`;
  }
}

function renderReactionResult(rxn, mode) {
  const el = document.getElementById('reaction-result');
  let html = `<div class="result-content">`;
  if (mode === 'equation') {
    html += `<h3>${rxn.type}</h3><div class="equation">${rxn.equation}</div><p>${rxn.explanation}</p>`;
  } else if (mode === 'realworld') {
    html += `<h3>What You Would Observe</h3><p>${rxn.realWorld}</p>`;
  } else {
    html += `<h3>Atomic / Visual View</h3><p>${rxn.visual}</p>`;
  }
  if (rxn.safety) html += `<div class="safety-note"><strong>Safety:</strong> ${rxn.safety}</div>`;
  html += `</div>`;
  el.innerHTML = html;
}

const MODULES = [
  { id: 'atomic', title: 'Atomic Structure', desc: 'Protons, neutrons, electrons, isotopes, electron configuration, quantum numbers',
    content: 'Atoms consist of a dense nucleus (protons + neutrons) surrounded by electrons in orbitals. The atomic number (Z) equals the number of protons. Mass number (A) = protons + neutrons. Isotopes have the same Z but different A. Electron configuration follows the Aufbau principle, Hund\'s rule and the Pauli exclusion principle. The four quantum numbers (n, l, ml, ms) fully describe an electron in an atom.' },
  { id: 'trends', title: 'Periodic Trends', desc: 'Atomic radius, ionization energy, electronegativity, electron affinity, reactivity patterns',
    content: 'Across a period: atomic radius decreases while ionization energy and electronegativity increase. Down a group: atomic radius increases while ionization energy and electronegativity decrease. These trends explain why alkali metals become more reactive down the group and why noble gases are largely inert.' },
  { id: 'bonding', title: 'Chemical Bonding', desc: 'Ionic, covalent, metallic bonds, polarity, intermolecular forces (London, dipole, hydrogen bonding)',
    content: 'Ionic bonds form between metals and non-metals by electron transfer. Covalent bonds share electrons (polar or non-polar). Metallic bonds involve a sea of delocalised electrons. Intermolecular forces determine boiling and melting points: London dispersion < dipole-dipole < hydrogen bonding.' },
  { id: 'stoich', title: 'Stoichiometry', desc: 'Mole concept, balancing equations, limiting reagents, theoretical & percentage yield',
    content: '1 mole = 6.022 × 10²³ particles (Avogadro\'s number). Molar mass converts grams ↔ moles. Balanced equations give mole ratios. The limiting reagent is completely consumed first and determines the maximum amount of product. Percentage yield = (actual yield / theoretical yield) × 100%.' },
  { id: 'states', title: 'States of Matter', desc: 'Gases, liquids, solids, phase changes, ideal gas law, kinetic molecular theory',
    content: 'Solids have fixed shape and volume. Liquids have fixed volume but take the shape of the container. Gases fill any available volume. The Ideal Gas Law is PV = nRT. Kinetic molecular theory explains gas behaviour through continuous particle motion and elastic collisions.' },
  { id: 'thermo', title: 'Thermodynamics', desc: 'Enthalpy, entropy, Gibbs free energy, endothermic/exothermic, spontaneity',
    content: 'Enthalpy (H) is the heat content at constant pressure. ΔH < 0 is exothermic. Entropy (S) measures disorder. Gibbs free energy: ΔG = ΔH − TΔS. A process is spontaneous when ΔG < 0. Temperature can reverse spontaneity when ΔH and ΔS have the same sign.' },
  { id: 'kinetics', title: 'Chemical Kinetics', desc: 'Reaction rates, rate laws, activation energy, catalysts, collision theory',
    content: 'Reaction rate depends on concentration, temperature, surface area and catalysts. Rate laws are determined experimentally. Activation energy (Ea) is the energy barrier that must be overcome. Catalysts lower Ea by providing an alternative pathway and are not consumed in the overall reaction.' },
  { id: 'equilibrium', title: 'Chemical Equilibrium', desc: 'Dynamic equilibrium, Le Chatelier\'s principle, equilibrium constants Kc and Kp',
    content: 'At equilibrium the forward and reverse rates are equal and concentrations remain constant. Kc = [products] / [reactants] (raised to stoichiometric powers). Le Chatelier\'s principle states that a system at equilibrium shifts to counteract changes in concentration, pressure or temperature.' },
  { id: 'acids', title: 'Acids & Bases', desc: 'pH scale, strong/weak acids & bases, buffers, titration curves, Ka and Kb',
    content: 'Arrhenius, Brønsted-Lowry and Lewis definitions exist. pH = −log[H⁺]. Strong acids and bases fully dissociate; weak ones establish equilibrium (Ka, Kb). Buffers resist pH change and consist of a weak acid + its conjugate base (or weak base + conjugate acid).' },
  { id: 'redox', title: 'Redox & Electrochemistry', desc: 'Oxidation numbers, balancing redox, galvanic cells, electrolysis, standard potentials',
    content: 'Oxidation is loss of electrons; reduction is gain of electrons. Oxidation numbers help track electron transfer. Galvanic (voltaic) cells produce electricity from spontaneous redox reactions. Electrolytic cells use electricity to drive non-spontaneous reactions. E°cell > 0 indicates a spontaneous reaction under standard conditions.' },
  { id: 'organic', title: 'Organic Chemistry Basics', desc: 'Hydrocarbons, functional groups, isomerism, nomenclature, common reaction types',
    content: 'Organic chemistry studies carbon compounds. Functional groups (–OH, C=O, –COOH, –NH₂, etc.) determine reactivity. Isomers share the same molecular formula but have different structures. Learn to name alkanes, alkenes, alcohols and simple aromatics, and recognise substitution, addition and elimination reactions.' },
  { id: 'nuclear', title: 'Nuclear Chemistry', desc: 'Radioactivity, half-life, fission, fusion, nuclear equations, applications',
    content: 'Radioactive decay (α, β, γ) changes the nucleus. Half-life is the time required for half the radioactive nuclei to decay. Fission splits heavy nuclei (used in nuclear power). Fusion combines light nuclei (the process that powers stars). Nuclear equations must conserve both mass number and atomic number.' }
];

function initLessons() {
  const grid = document.getElementById('modules-grid');
  MODULES.forEach(m => {
    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `<h3>${m.title}</h3><p>${m.desc}</p><div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>`;
    card.addEventListener('click', () => openModule(m));
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
      <div style="line-height:1.7; margin-top:1rem; font-size:1.05rem;">
        ${m.content}
      </div>
      <p style="margin-top:1.25rem; font-size:0.9rem; color:var(--text-muted);">
        <strong>Next steps:</strong> Try the Reaction Simulator and Tools. Worked examples and practice questions will be added in future updates.
      </p>
      <button class="secondary-btn" style="margin-top:1rem;" onclick="document.getElementById('lesson-content').style.display='none'">Close</button>
    </div>
  `;
  content.scrollIntoView({ behavior: 'smooth' });
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
  { term: "Stoichiometry", def: "The quantitative relationship between reactants and products in a chemical reaction." }
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
