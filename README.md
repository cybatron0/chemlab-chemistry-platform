# ChemLab — Interactive Chemistry Learning Platform

A colourful, modern, fully client-side chemistry e-learning platform built with pure HTML, CSS and Vanilla JS (zero build step).

## Live Demos
- Primary advanced experience: [chemlaboratory.vercel.app](https://chemlaboratory.vercel.app/)
- This repository is linked to multiple Vercel projects (chemlab-final, chemlab-live, etc.)

## Features
- **Interactive Periodic Table** — Search, category filters, detailed element cards (electron config, uses, properties)
- **Reaction Simulator** — Select reactants → run → equation / real-world observation / atomic visual modes + safety notes
- **Handy Calculators** — Molarity, stoichiometry (g → mol), temperature (°C ↔ K/°F), dilution (C₁V₁ = C₂V₂)
- **Structured Lessons** — 12 core modules from atomic structure to nuclear chemistry
- **Searchable Glossary** of key terms
- **Dark / Light mode** with localStorage persistence
- **XP system** — Earn points exploring reactions and using tools
- Fully client-side and offline-capable once loaded

## Tech Stack
- Pure HTML5 + CSS3 + Vanilla JavaScript
- No frameworks or build tools required
- LocalStorage for theme + XP
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
│   └── reactions-data.js
└── README.md
```

## Possible Next Improvements
- Full 118-element table with lanthanide/actinide rows
- Expanded reaction database + multi-reactant support
- Quizzes & progress tracking
- 3D molecule viewer
- Lab report export

## License
MIT — fork, learn, improve.

Built for students and educators. This is a simulation only — always prioritise real-lab safety.
