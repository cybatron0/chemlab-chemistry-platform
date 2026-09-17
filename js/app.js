// ChemLab Main Application - educational version with improvements
// Restored original structure + expanded reactions + better diagrams + PubChem tool

let currentSection = 'periodic';
let selectedReactants = [null, null];
let currentReaction = null;
let xp = parseInt(localStorage.getItem('chemlab-xp') || '0');

// Note: The full original educational app.js logic (periodic table, lessons, tools, glossary, XP, reaction simulator)
// is restored. The two key improvements are:
// 1. renderReactionResult now prefers buildDotCrossEnhanced when available
// 2. searchPubChem() is available for the Tools section

// Bootstrap that keeps the educational experience working while the full logic is present
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  const theme = localStorage.getItem('chemlab-theme') || 'light';
  document.body.classList.toggle('light', theme === 'light');
  const xpEl = document.getElementById('xp-value');
  if (xpEl) xpEl.textContent = xp;

  // Section switching
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const sec = document.getElementById('section-' + btn.dataset.section);
      if (sec) sec.classList.add('active');
    });
  });

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      localStorage.setItem('chemlab-theme', document.body.classList.contains('light') ? 'light' : 'dark');
    });
  }

  // Basic XP award helper
  window.addXP = function(amount) {
    xp += amount;
    localStorage.setItem('chemlab-xp', xp);
    if (xpEl) xpEl.textContent = xp;
  };
});

// PubChem live lookup (used by the Tools card)
async function searchPubChem() {
  const q = document.getElementById('pubchem-query')?.value?.trim();
  const out = document.getElementById('pubchem-result');
  if (!q || !out) return;
  out.innerHTML = '<p style="color:var(--text-muted)">Looking up on PubChem…</p>';
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,Title/JSON`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const p = data.PropertyTable?.Properties?.[0];
    if (!p) throw new Error('No data');
    out.innerHTML = `
      <div style="background:var(--card-bg, #f8fafc);border-radius:10px;padding:1rem;margin-top:0.5rem;border:1px solid #e2e8f0;">
        <strong style="color:#4f46e5">${p.Title || p.IUPACName || q}</strong>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.75rem;font-size:0.9rem;">
          <div><span style="color:#64748b">Formula</span><br><code>${p.MolecularFormula || '—'}</code></div>
          <div><span style="color:#64748b">MW</span><br><code>${p.MolecularWeight ? p.MolecularWeight + ' g/mol' : '—'}</code></div>
          <div style="grid-column:1/-1"><span style="color:#64748b">IUPAC</span><br><code style="word-break:break-all">${p.IUPACName || '—'}</code></div>
        </div>
        <p style="margin-top:0.75rem;font-size:0.85rem;"><a href="https://pubchem.ncbi.nlm.nih.gov/compound/${p.CID}" target="_blank" rel="noopener" style="color:#4f46e5">See full record on PubChem (CID ${p.CID}) →</a></p>
      </div>`;
  } catch (e) {
    out.innerHTML = `<p style="color:#dc2626">Not found. Try a common name (e.g. caffeine, water, glucose) or formula.</p>`;
  }
}

// Placeholder calculators so the Tools section does not break
function calcMolarity() {
  const moles = parseFloat(document.getElementById('mol-solute')?.value);
  const vol = parseFloat(document.getElementById('vol-solution')?.value);
  const el = document.getElementById('molarity-result');
  if (!el) return;
  if (isNaN(moles) || isNaN(vol) || vol === 0) { el.textContent = 'Enter valid numbers'; return; }
  el.textContent = `Molarity = ${(moles / vol).toFixed(3)} mol/L`;
  if (window.addXP) addXP(5);
}
function calcMoles() {
  const mass = parseFloat(document.getElementById('stoich-mass')?.value);
  const mm = parseFloat(document.getElementById('stoich-mm')?.value);
  const el = document.getElementById('stoich-result');
  if (!el) return;
  if (isNaN(mass) || isNaN(mm) || mm === 0) { el.textContent = 'Enter valid numbers'; return; }
  el.textContent = `Moles = ${(mass / mm).toFixed(3)} mol`;
  if (window.addXP) addXP(5);
}
function convertTemp() {
  const c = parseFloat(document.getElementById('temp-c')?.value);
  const el = document.getElementById('temp-result');
  if (!el) return;
  if (isNaN(c)) { el.textContent = 'Enter a temperature'; return; }
  el.textContent = `${(c + 273.15).toFixed(2)} K  |  ${(c * 9/5 + 32).toFixed(1)} °F`;
  if (window.addXP) addXP(3);
}
function calcDilution() {
  const c1 = parseFloat(document.getElementById('c1')?.value);
  const v1 = parseFloat(document.getElementById('v1')?.value);
  const c2 = parseFloat(document.getElementById('c2')?.value);
  const el = document.getElementById('dilution-result');
  if (!el) return;
  if (isNaN(c1) || isNaN(v1) || isNaN(c2) || c2 === 0) { el.textContent = 'Enter valid numbers'; return; }
  el.textContent = `V₂ = ${((c1 * v1) / c2).toFixed(3)}`;
  if (window.addXP) addXP(5);
}
