# Liver Lens — liver treatment explorer

A two-screen educational proof of concept: record individual tumours, then explore four treatment groups through short, user-driven visual sequences. Built with **SvelteKit, TypeScript, SVG and CSS**, using Svelte’s `tweened` motion and `fade` transitions. No backend, database, React, 3D library or game engine.

## Run on your Mac

Requires Node.js 22.18+ or 24 LTS and pnpm. From this folder:

```sh
pnpm install --frozen-lockfile
pnpm dev --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** in Safari, Chrome or the Codex browser. The server listens only on this Mac. It does not publish the app. Keep its terminal running; Ctrl+C stops it.

```sh
pnpm check       # Svelte + TypeScript diagnostics
pnpm test        # Eleven focused model and clinical-rule tests
pnpm build       # GitHub Pages static files in docs/
pnpm preview     # Preview at http://127.0.0.1:4173/liver-lens/
```

The included `pnpm-lock.yaml` records dependency versions. `pnpm-workspace.yaml` permits esbuild’s normal installation step. No credentials are needed. The installed app uses local assets and system-font fallbacks; it makes no case-data requests. Refresh resets case state; editing within the app preserves it.

## GitHub Pages

The repository includes editable Svelte source and its production output in `docs/`. The production base path is `/liver-lens`; development still runs at `/`. Assets use that base path, and `static/.nojekyll` is copied into `docs/.nojekyll` on every build so GitHub serves the `_app` directory. Fonts are system fonts, with no external font downloads.

After the initial push, enable Pages in [this repository’s settings](https://github.com/buntyke/liver-lens/settings/pages):

1. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
2. Select branch **main** and folder **/docs**, then **Save**.
3. Wait for GitHub’s Pages deployment to finish. The site address is [https://buntyke.github.io/liver-lens/](https://buntyke.github.io/liver-lens/).

The site may return 404 until Pages is enabled and the first deployment finishes. No custom Actions publishing workflow is required. See [GitHub’s branch publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

For future updates, edit `src/` or `static/`, then run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm preview
```

Inspect **http://127.0.0.1:4173/liver-lens/**, then commit and push both source changes and the refreshed `docs/` output to `main`. GitHub publishes the committed output; changing source alone does not update the site. Do not edit `docs/` by hand: the static adapter regenerates it on each build. Keep `docs/.nojekyll` tracked. Configuration follows [SvelteKit’s static deployment guidance](https://svelte.dev/docs/kit/adapter-static).

## Read and edit the code

| File | Responsibility |
| --- | --- |
| `src/routes/+page.svelte` | Two-screen state, four treatment controls, navigation and optional WebMCP registration |
| `src/lib/CaseForm.svelte` | Individual tumour rows, list completeness, clinical inputs and fictional cases |
| `src/lib/tumours.ts` | Lesion list, stable labels, add/remove/select helpers and conservative aggregate values |
| `src/lib/rules.ts` | Typed case model, pure `evaluate()` function, rule explanations, sample values |
| `src/lib/Anatomy.svelte` | Layered SVG liver, separate vessel trees, target selection, focus and step/scrub mechanisms |
| `src/lib/artwork.ts` | Small liver silhouette for the case-screen vignette |
| `src/lib/OrganVignette.svelte` | Small case-sheet organ drawing on the case screen |
| `src/lib/TreatmentPanel.svelte` | Compact whole-case status and optional reasons, explanations and sources |
| `src/app.css` | Cool blue palette, typography, responsive layout and focus styles |
| `tests/rules.test.ts` | Unknowns, boundaries, function impairment and other meaningful clinical branches |
| `src/routes/+layout.ts` | Static prerendering option |
| `svelte.config.js` | Static adapter and preprocessing |

Local draft archives and design-review screenshots are excluded from this repository and are not published.

## Data and interaction model

`CaseInput` contains a `pattern` (unknown, individually listed, or diffuse), `coverage` (unknown, complete, or partial), a list of tumours, and the four clinical context fields. Each tumour has a stable `T` label, size in cm, lobe and approximate upper/middle/lower area. Sizes can be unknown. Lists support up to 12 lesions; the UI explicitly asks whether all lesions were recorded and calls out the drawing limit. Partial lists never become a known total count. Removing the final row returns to an unknown pattern rather than inventing a zero-tumour diagnosis.

`aggregate()` derives the complete count and largest size for the existing clinical subset. If even one recorded size is missing, the aggregate size remains unknown. A separate largest-known value is never used as a complete maximum. All recorded tumours contribute to assessment; selecting a target affects only the drawing. Clinical function and known spread/invasion retain priority over simple burden mapping. To change a rule, edit `evaluate()` and its meaningful regression tests.

The explorer starts neutral. Choose a treatment, choose a lesion from the diagram or list, and advance with the labelled action, numbered steps, or keyboard-operable progress slider. No sequence starts automatically. Reset returns to the first frame. “Still steps” disables the short between-step transitions; the OS reduced-motion preference uses the same instant rendering path and disables zoom transitions. Navigation back to the case retains entered details and clears treatment selection.

The vessel buttons separately reveal hepatic arterial inflow, portal venous inflow and hepatic venous drainage. TACE keeps the hepatic artery visible and moves a catheter and particles along the same schematic arterial feeder; it does not use the portal or hepatic veins as delivery routes. Ablation illustrates probe placement and a growing local zone. Resection and transplant are separate surgery mechanisms; medicines illustrate systemic circulation. Generic mechanisms remain accessible alongside unknown, assessment-needed or not-recommended case states, labelled as mechanism-only exploration. They do not establish candidacy.

The SVG stage uses original vector layers, shading and natural organ colours. It is an 840 × 590 schematic, with the person’s right on the viewer’s left. Recorded lesion diameters share a linear drawing scale; tiny lesions have a minimum visible dot size. Every lesion remains in the list. Unknown lobes stay in an unmapped tray; selecting one uses an explicitly labelled generic site for a local sequence. Approximate regions, overlapping lesions, vessel branches, resection outlines, probe paths and treatment zones are illustrative, never imaging coordinates or safe procedure plans. A local target illustration does not treat the other recorded lesions. There is no response prediction, cure score, dose control or precise needle-navigation exercise.

The supplied medical reference images informed the clarity of the new probe, zone and catheter diagrams; the images themselves are not embedded or copied. Device-specific zone geometries, combined therapies and heat-sink thresholds were not implemented. The interface’s calm step-by-step controls draw general inspiration from the developer’s [Satistory listing](https://play.google.com/store/apps/details?hl=en&id=com.tidy.satis.asmr); no claim is made about playing or reproducing its levels.

## Clinical scope and sources

This is for **hepatocellular carcinoma (HCC)**, not all cancers found in the liver. The four interface groups are Surgery, Ablation, Artery treatment (TACE) and Medicines; they are not four official BCLC categories or an exhaustive treatment inventory.

The rule framework is a deliberately small subset of **Reig et al., BCLC 2022**, Journal of Hepatology 76:681–693, DOI [10.1016/j.jhep.2021.11.018](https://doi.org/10.1016/j.jhep.2021.11.018). The relevant material was verified in the [accessible paper](https://www.arganz.org/wp-content/uploads/2023/10/HCC-staging-and-treatment-2022-BCLC.pdf), especially the treatment sections and Figure 1 on pp. 682–686. [PMC copy](https://pmc.ncbi.nlm.nih.gov/articles/PMC8866082/).

The [2026 BCLC update](https://pubmed.ncbi.nlm.nih.gov/41151697/) exists, DOI 10.1016/j.jhep.2025.10.020; its PubMed record also identifies a June 2026 erratum. Full 2026 recommendations and the erratum have **not** been implemented or validated here. The optional “Why this result?” help states this distinction.

Treatment mechanism descriptions use the [National Cancer Institute treatment overview](https://www.cancer.gov/types/liver/what-is-liver-cancer/treatment). Separate arterial and portal inflow are supported by the [NCI clinical overview](https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq) and [Hepatic microcirculation](https://pubmed.ncbi.nlm.nih.gov/21326548/); hepatic venous drainage is described in the [Portal venous system anatomy review](https://pubmed.ncbi.nlm.nih.gov/32119476/). These were checked during this draft. The BCLC 2022 multiple-small-lesion branch requires all 2–3 nodules to be ≤3 cm, not only the selected lesion.

Key implementation limits:

- Uncollected facts stay unknown. Liver function and cancer-related activity use broad categories, not a computed clinical score. No BCLC stage is assigned.
- The ≤3 cm single-tumour ablation example is a prototype boundary, not an absolute contraindication. A larger tumour receives an assessment-needed result. Size alone does not exclude surgery.
- Surgery groups resection and transplant; they do not have the same eligibility. The multiple-small-tumour branch illustrates transplant.
- TACE needs details absent from the form, so its general mechanism can accompany an assessment-needed result. It never implies verified artery accessibility or adequate portal flow. Bilobar disease alone is not labelled diffuse disease.
- Vessel invasion/spread and diffuse disease inform the systemic discussion. Impaired liver function or substantial activity limitations override simple mapping with individual assessment, including transplant eligibility and supportive care.
- Imaging, portal pressure, liver reserve, blood flow, transplant criteria, other illnesses, previous treatment and preferences require clinical review. No survival estimate, guaranteed response or actual procedure plan is provided.

## Review the prototype

Try “Four different tumours”. Change one size or location, add/remove a lesion, and verify whether the list is complete. On screen two, select a tumour directly or use its labelled card. Toggle each vessel, then explore Ablation and Artery treatment with the stage controls. Try the focused view to inspect probe, zone and particles. Surgery offers resection and transplant sequences; Medicines shows a whole-body mechanism. Open “Why this result?” for the independent whole-case assessment.

Try unknown fields and an incomplete list: they must remain unknown in the result. An unlocated tumour must remain in the unmapped tray until a clearly labelled generic mechanism is selected. Return to edit and check that the explorer reopens without a selected treatment.

The optional `explore_treatment` WebMCP tool still accepts only a treatment ID. It uses the current full case and resets the visible mechanism to its first step. It neither alters tumour entries nor advances the sequence. Unsupported browsers retain all ordinary UI controls.

This second version preserves the existing GitHub Pages configuration. Clinician review of the drawing and rule subset is still needed before use beyond education and design review.
