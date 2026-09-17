# ChemLab — Interactive Chemistry Learning Platform

A colourful, modern, fully client-side chemistry e-learning platform built with pure HTML, CSS and Vanilla JS (zero build step).

## Live Demos
- Primary advanced experience: [chemlaboratory.vercel.app](https://chemlaboratory.vercel.app/)
- This repository is linked to multiple Vercel projects (chemlab-final, chemlab-live, etc.)

## Features
- **Interactive Periodic Table** — Search, category filters, detailed element cards (electron config, uses, properties)
- **Reaction Simulator** — Select reactants → run → equation / real-world observation / atomic visual modes + **improved SVG Dot-and-Cross diagrams**
- **Expanded Reaction Database** — 35+ curated reactions covering acid-base, redox, precipitation, synthesis, decomposition, combustion and organic reactions
- **Live PubChem Lookup** — Real-time compound data (formula, molecular weight, IUPAC name, SMILES) from NCBI PubChem
- **Handy Calculators** — Molarity, stoichiometry (g → mol), temperature (°C ↔ K/°F), dilution (C₁V₁ = C₂V₂)
- **Structured Lessons** — 12 core modules from atomic structure to nuclear chemistry
- **Searchable Glossary** of key terms
- **Dark / Light mode** with localStorage persistence
- **XP system** — Earn points exploring reactions and using tools
- Fully client-side and offline-capable once loaded (PubChem requires network)

## Tech Stack
- Pure HTML5 + CSS3 + Vanilla JavaScript
- No frameworks or build tools required
- LocalStorage for theme + XP
- PubChem PUG-REST for live compound data
- Responsive design

## Getting Started
```bash
git clone https://github.com/cybatron0/chemlab-chemistry-platform.git
cd chemlab-chemistry-platform
# Open index.html or serve statically
npx serve .
```

## Project Structure
```
├── index.html
├── css/styles.css
├── js/
│   ├── app.js
│   ├── elements-data.js
│   ├── reactions-data.js
│   └── diagrams-bridge.js   ← enhanced SVG dot-and-cross diagrams
└── README.md
```

## Recent Improvements (Sep 2026)
- Expanded reaction database (+15 carefully curated reactions)
- Proper SVG-based Dot-and-Cross diagrams for H₂O, NH₃, CH₄, CO₂, NaCl, MgO, H₂ etc.
- Live PubChem compound search integrated into Tools
- Better fallback messaging when no diagram is available

## Possible Next Improvements
- Full 118-element table with lanthanide/actinide rows
- Even larger reaction set + multi-reactant support
- Quizzes & progress tracking
- 3D molecule viewer
- Lab report export

## License
MIT — fork, learn, improve.

Built for students and educators. This is a simulation only — always prioritise real-lab safety.
