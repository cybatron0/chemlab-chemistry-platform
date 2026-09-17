// Expanded local reaction database for ChemLab
const REACTIONS = [
  { id: "ab1", equation: "HCl + NaOH → NaCl + H₂O", reactants: ["HCl", "NaOH"], products: ["NaCl", "H2O"], type: "acid-base", description: "Strong acid + strong base neutralisation" },
  { id: "ab2", equation: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O", reactants: ["H2SO4", "NaOH"], products: ["Na2SO4", "H2O"], type: "acid-base", description: "Sulfuric acid + sodium hydroxide" },
  { id: "ab3", equation: "CH₃COOH + NaOH → CH₃COONa + H₂O", reactants: ["CH3COOH", "NaOH", "acetic acid"], products: ["CH3COONa", "H2O"], type: "acid-base", description: "Weak acid (acetic) + strong base" },
  { id: "pp1", equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃", reactants: ["AgNO3", "NaCl"], products: ["AgCl", "NaNO3"], type: "precipitation", description: "Silver chloride precipitate (classic)" },
  { id: "pp2", equation: "BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl", reactants: ["BaCl2", "Na2SO4"], products: ["BaSO4", "NaCl"], type: "precipitation", description: "Barium sulfate white precipitate" },
  { id: "pp3", equation: "Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃", reactants: ["Pb(NO3)2", "KI"], products: ["PbI2", "KNO3"], type: "precipitation", description: "Lead iodide yellow precipitate" },
  { id: "rd1", equation: "2Mg + O₂ → 2MgO", reactants: ["Mg", "O2"], products: ["MgO"], type: "redox", description: "Magnesium combustion / oxidation" },
  { id: "rd2", equation: "Zn + CuSO₄ → ZnSO₄ + Cu", reactants: ["Zn", "CuSO4"], products: ["ZnSO4", "Cu"], type: "redox", description: "Displacement: zinc displaces copper" },
  { id: "rd3", equation: "2Al + Fe₂O₃ → Al₂O₃ + 2Fe", reactants: ["Al", "Fe2O3"], products: ["Al2O3", "Fe"], type: "redox", description: "Thermite reaction" },
  { id: "sy1", equation: "N₂ + 3H₂ → 2NH₃", reactants: ["N2", "H2"], products: ["NH3"], type: "synthesis", description: "Haber-Bosch process (ammonia synthesis)" },
  { id: "sy2", equation: "2H₂ + O₂ → 2H₂O", reactants: ["H2", "O2"], products: ["H2O"], type: "synthesis", description: "Hydrogen combustion / water formation" },
  { id: "dc1", equation: "2H₂O₂ → 2H₂O + O₂", reactants: ["H2O2"], products: ["H2O", "O2"], type: "decomposition", description: "Hydrogen peroxide decomposition (catalysed)" },
  { id: "dc2", equation: "CaCO₃ → CaO + CO₂", reactants: ["CaCO3"], products: ["CaO", "CO2"], type: "decomposition", description: "Thermal decomposition of limestone" },
  { id: "cb1", equation: "CH₄ + 2O₂ → CO₂ + 2H₂O", reactants: ["CH4", "O2", "methane"], products: ["CO2", "H2O"], type: "combustion", description: "Complete combustion of methane" },
  { id: "cb2", equation: "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O", reactants: ["C2H5OH", "O2", "ethanol"], products: ["CO2", "H2O"], type: "combustion", description: "Ethanol combustion" },
  { id: "org1", equation: "C₂H₄ + H₂ → C₂H₆", reactants: ["C2H4", "H2", "ethene"], products: ["C2H6"], type: "organic", description: "Hydrogenation of ethene" },
  { id: "org2", equation: "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O", reactants: ["CH3COOH", "C2H5OH", "acetic acid", "ethanol"], products: ["CH3COOC2H5", "H2O"], type: "organic", description: "Esterification (ethyl acetate)" },
  { id: "ex1", equation: "2HCl + Mg → MgCl₂ + H₂", reactants: ["HCl", "Mg"], products: ["MgCl2", "H2"], type: "redox", description: "Metal + acid → salt + hydrogen" },
  { id: "ex2", equation: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂", reactants: ["Na2CO3", "HCl"], products: ["NaCl", "H2O", "CO2"], type: "acid-base", description: "Carbonate + acid → salt + water + CO₂" }
];

function normalise(str) {
  if (!str) return "";
  return str.toString().toLowerCase()
    .replace(/₂/g, "2").replace(/₃/g, "3").replace(/₄/g, "4")
    .replace(/₅/g, "5").replace(/₆/g, "6").replace(/₇/g, "7")
    .replace(/₈/g, "8").replace(/₉/g, "9").replace(/₀/g, "0")
    .replace(/⁺/g, "+").replace(/⁻/g, "-")
    .replace(/\s+/g, "").replace(/[()]/g, "");
}

function searchReactions(query, typeFilter = "all") {
  const q = normalise(query);
  return REACTIONS.filter(r => {
    const typeMatch = typeFilter === "all" || r.type === typeFilter;
    if (!typeMatch) return false;
    if (!q) return true;
    const haystack = normalise(r.equation + " " + r.description + " " + r.reactants.join(" ") + " " + r.products.join(" "));
    return haystack.includes(q);
  });
}

function findReactionsByReactants(reactants) {
  const norms = reactants.map(normalise).filter(Boolean);
  if (norms.length === 0) return [];
  return REACTIONS.filter(r => {
    const rNorms = r.reactants.map(normalise);
    return norms.every(n => rNorms.some(rn => rn.includes(n) || n.includes(rn)));
  });
}
