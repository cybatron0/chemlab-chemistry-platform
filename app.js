// ChemLab main application logic - full improved version
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  const queryInput = document.getElementById("compoundQuery");
  const searchBtn = document.getElementById("searchBtn");
  const statusEl = document.getElementById("searchStatus");
  const resultEl = document.getElementById("compoundResult");

  async function searchCompound(q) {
    if (!q.trim()) return;
    statusEl.textContent = "Querying PubChem…";
    statusEl.className = "status-msg loading";
    resultEl.classList.add("hidden");
    searchBtn.disabled = true;
    try {
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q.trim())}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,Title/JSON`;
      const res = await fetch(url);
      if (!res.ok) {
        if (/^\d+$/.test(q.trim())) {
          const cidUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${q.trim()}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,Title/JSON`;
          const cidRes = await fetch(cidUrl);
          if (!cidRes.ok) throw new Error("Compound not found");
          const data = await cidRes.json();
          displayCompound(data, q);
        } else {
          throw new Error("Compound not found in PubChem");
        }
      } else {
        const data = await res.json();
        displayCompound(data, q);
      }
    } catch (err) {
      statusEl.textContent = err.message || "Lookup failed. Check spelling or try a different name / CID.";
      statusEl.className = "status-msg error";
    } finally {
      searchBtn.disabled = false;
    }
  }

  function displayCompound(data, query) {
    const props = data.PropertyTable?.Properties?.[0];
    if (!props) {
      statusEl.textContent = "No property data returned.";
      statusEl.className = "status-msg error";
      return;
    }
    statusEl.textContent = `Found via PubChem (CID ${props.CID})`;
    statusEl.className = "status-msg";
    resultEl.innerHTML = `
      <h3>${props.Title || props.IUPACName || query}</h3>
      <div class="prop-grid">
        <div class="prop"><div class="prop-label">Molecular Formula</div><div class="prop-value">${props.MolecularFormula || "—"}</div></div>
        <div class="prop"><div class="prop-label">Molecular Weight</div><div class="prop-value">${props.MolecularWeight ? props.MolecularWeight + " g/mol" : "—"}</div></div>
        <div class="prop"><div class="prop-label">IUPAC Name</div><div class="prop-value">${props.IUPACName || "—"}</div></div>
        <div class="prop"><div class="prop-label">Canonical SMILES</div><div class="prop-value">${props.CanonicalSMILES || "—"}</div></div>
        <div class="prop"><div class="prop-label">PubChem CID</div><div class="prop-value">${props.CID}</div></div>
      </div>
      <p style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted)">
        <a href="https://pubchem.ncbi.nlm.nih.gov/compound/${props.CID}" target="_blank" rel="noopener" style="color:var(--primary)">View full record on PubChem →</a>
      </p>`;
    resultEl.classList.remove("hidden");
  }

  searchBtn.addEventListener("click", () => searchCompound(queryInput.value));
  queryInput.addEventListener("keydown", e => { if (e.key === "Enter") searchCompound(queryInput.value); });
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      queryInput.value = chip.dataset.q;
      searchCompound(chip.dataset.q);
    });
  });

  // Reactions
  const reactionQuery = document.getElementById("reactionQuery");
  const reactionSearchBtn = document.getElementById("reactionSearchBtn");
  const reactionList = document.getElementById("reactionList");
  let currentFilter = "all";

  function renderReactions(list) {
    if (list.length === 0) {
      reactionList.innerHTML = `<p style="color:var(--text-muted)">No matching reactions found.</p>`;
      return;
    }
    reactionList.innerHTML = list.map(r => `
      <div class="reaction-card">
        <div class="reaction-eq">${r.equation}</div>
        <div class="reaction-meta">
          <span class="badge type-${r.type}">${r.type}</span>
          <span>${r.description}</span>
        </div>
      </div>`).join("");
  }

  function doReactionSearch() {
    const results = searchReactions(reactionQuery.value, currentFilter);
    renderReactions(results);
  }

  reactionSearchBtn.addEventListener("click", doReactionSearch);
  reactionQuery.addEventListener("keydown", e => { if (e.key === "Enter") doReactionSearch(); });
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.filter;
      doReactionSearch();
    });
  });
  renderReactions(REACTIONS);

  // Diagrams
  const diagramSelect = document.getElementById("diagramSelect");
  const drawBtn = document.getElementById("drawDiagramBtn");
  const diagramOutput = document.getElementById("diagramOutput");
  const diagramInfo = document.getElementById("diagramInfo");

  drawBtn.addEventListener("click", () => {
    const key = diagramSelect.value;
    if (!key) {
      diagramOutput.innerHTML = `<p class="placeholder">Please select a molecule or ion first.</p>`;
      diagramInfo.classList.add("hidden");
      return;
    }
    const result = generateDiagram(key);
    if (!result) {
      diagramOutput.innerHTML = `<p class="placeholder">Diagram not available for this species yet.</p>`;
      return;
    }
    diagramOutput.innerHTML = result.svg;
    diagramInfo.innerHTML = `
      <h4>${result.name}</h4>
      <p><strong>Type:</strong> ${result.type}</p>
      <p>${result.description}</p>
      <p style="margin-top:0.5rem;font-size:0.8rem;color:var(--text-muted)">Green dots = electrons from one atom · Yellow crosses = electrons from the other atom</p>`;
    diagramInfo.classList.remove("hidden");
  });

  // Mixer
  const mixBtn = document.getElementById("mixBtn");
  const mixerResult = document.getElementById("mixerResult");
  mixBtn.addEventListener("click", () => {
    const r1 = document.getElementById("reactant1").value.trim();
    const r2 = document.getElementById("reactant2").value.trim();
    const r3 = document.getElementById("reactant3").value.trim();
    const reactants = [r1, r2, r3].filter(Boolean);
    if (reactants.length < 1) {
      mixerResult.innerHTML = `<p style="color:var(--danger)">Enter at least one reactant.</p>`;
      mixerResult.classList.remove("hidden");
      return;
    }
    const matches = findReactionsByReactants(reactants);
    if (matches.length === 0) {
      mixerResult.innerHTML = `
        <h3>No exact match in local database</h3>
        <p style="color:var(--text-muted);margin-top:0.5rem">The local engine contains ${REACTIONS.length} curated common reactions. Try the Reactions tab or look up individual compounds. For large organic sets see the <a href="https://open-reaction-database.org" target="_blank" rel="noopener" style="color:var(--primary)">Open Reaction Database</a>.</p>`;
    } else {
      mixerResult.innerHTML = `
        <h3>Possible reaction${matches.length > 1 ? "s" : ""} found</h3>
        ${matches.map(r => `
          <div style="margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border)">
            <div class="reaction-eq">${r.equation}</div>
            <div class="reaction-meta" style="margin-top:0.4rem">
              <span class="badge type-${r.type}">${r.type}</span>
              <span>${r.description}</span>
            </div>
          </div>`).join("")}`;
    }
    mixerResult.classList.remove("hidden");
  });
});
