# Prototype verification

## Second version verification

Verified on 12 September 2026. The earlier sections below describe the initial published version and its previous controls.

- Svelte/TypeScript: 0 errors and 0 warnings. All 11 updated model/rule tests passed. Static production build succeeded. Staged source/documentation whitespace checks passed; the generated JavaScript contains a compiler-produced whitespace string literal that Git flags, which is preserved unchanged.
- Individual tumour add/remove, per-lesion sizes and locations, selection fallback, 12-lesion bound, unknown sizes, incomplete counts, and whole-case assessment independent of the selected target are covered by focused tests.
- Browser: input examples, add/remove, neutral explorer, all four treatment groups, separate resection/transplant sequences, ablation probe/zone, arterial catheter/particles and systemic mechanism exercised. Sequences advance through explicit controls.
- Browser: diagram target selection with Enter, vessel toggles, focus view, still steps, progress-slider End key, optional help and source disclosures verified. Editing retained sizes, unknown location and partial-list coverage; reopening cleared treatment selection.
- Production output served under `/liver-lens/`: both screens and assets worked, the unknown-lobe tray remained explicit, and a generic mechanism retained the independent incomplete-case assessment. Final production console check returned no warnings or errors.
- Mobile 390 × 844: form and explorer inspected, help and focused TACE exercised, and document width matched viewport width. Desktop 1440 × 1000: form, vessel layers, target selection and treatment controls inspected.
- Three review screenshots are saved in ignored `design-review/`: `v2-form-desktop.png`, `v2-ablation-desktop.png`, and `v2-tace-mobile.png`.

The OS reduced-motion preference was not changed; the manual still-steps path was exercised. Cross-browser/device testing and clinician validation remain outstanding. Geometry, generic target sites, vessel branches and treatment zones remain schematic; closely placed lesions can overlap, with every recorded lesion accessible in the list. The 2026 BCLC update is not implemented. No real patient data was used.

These checks were performed locally before committing and publishing the second version. Source and matching generated `docs/` output are included together; ignored screenshots and local caches remain excluded.

## Initial version verification

Verified locally on 12 September 2026 using Node 24.19.0 and the Codex in-app browser.

- Svelte/TypeScript diagnostics: 0 errors and 0 warnings.
- Nine focused rule tests passed: small tumour discussion, TACE uncertainty, invasion/spread, unknowns, impaired function, 3 cm boundary, transplant versus diffuse patterns, location independence and invalid inputs.
- Production static build completed successfully with `@sveltejs/adapter-static`.
- Browser: fictional sample loading, initial neutral explorer, exactly four treatment buttons, all four treatments, surgery discussion, ablation discussion, TACE clinical-assessment explanation, early-case medicines exclusion, advanced-case medicines animation, and all four unknown branches verified.
- Browser: edit navigation preserved case values; opening the explorer cleared the old selection. Zoom, pause, resume, replay and still-view controls were exercised.
- All four markers for the “4 or more” bilobar case were visually checked after fixing a clipped marker.
- Mobile 390 × 844: both screens visually inspected; measured document width 390 with viewport width 390 (no horizontal overflow).
- WebMCP `explore_treatment`: valid input changed the visible treatment and returned a serializable result; invalid treatment rejected without changing the selected treatment.
- Browser console had no errors at the final TACE interaction check.

The OS reduced-motion path is implemented with `matchMedia`, but changing the Mac's preference was not part of verification. The equivalent manual still-view path was tested. Cross-browser/device coverage and clinician validation remain future work.

No real patient data was used.

## GitHub Pages preparation

- Production output generated in `docs/` for `/liver-lens/`, with `docs/.nojekyll` present.
- Production HTML references existing CSS, JavaScript and favicon assets beneath the repository base path; the header icon loads.
- Served the committed-output candidate directly from a static file server at `/liver-lens/`. Verified fictional-case loading, both screens, neutral initial selection, ablation results, zoom, pause, edit with case preservation, and reload. No production browser console errors.
- Svelte/TypeScript: zero errors/warnings. All nine rule tests passed. Static build succeeded.
- Source, lockfile and generated `docs/` are included for branch-based Pages publishing. Local caches, dependencies, draft archives and design-review screenshots are excluded.
- Pages must be enabled by the repository owner with source Deploy from a branch, branch main, folder /docs. Live deployment is not asserted by these local checks.
