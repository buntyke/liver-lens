# Prototype verification

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
