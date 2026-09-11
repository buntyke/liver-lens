# Liver Lens — liver treatment explorer

A two-screen educational proof of concept for reviewing with a clinician: enter a case, then explore four treatment groups. Built with **SvelteKit, TypeScript, SVG and CSS**, using Svelte’s `tweened` motion and `fade` transitions. No backend, database, React, 3D library or game engine.

## Run on your Mac

Requires Node.js 22.18+ or 24 LTS and pnpm. From this folder:

```sh
pnpm install --frozen-lockfile
pnpm dev --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** in Safari, Chrome or the Codex browser. The server listens only on this Mac. It does not publish the app. Keep its terminal running; Ctrl+C stops it.

```sh
pnpm check       # Svelte + TypeScript diagnostics
pnpm test        # Nine focused clinical-rule regression tests
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
| `src/lib/CaseForm.svelte` | Seven inputs, fictional examples, validation and labels |
| `src/lib/rules.ts` | Typed case model, pure `evaluate()` function, rule explanations, sample values |
| `src/lib/Anatomy.svelte` | Original SVG organs, tumour markers, zoom and procedure playback |
| `src/lib/artwork.ts` | Shared rounded liver outline used by both screens |
| `src/lib/OrganVignette.svelte` | Small case-sheet organ drawing on the case screen |
| `src/lib/TreatmentPanel.svelte` | Neutral initial panel, assessment status and short treatment explanations |
| `src/app.css` | Warm palette, typography, component layout and responsive breakpoints |
| `tests/rules.test.ts` | Unknowns, boundaries, function impairment and other meaningful clinical branches |
| `src/routes/+layout.ts` | Static prerendering option |
| `svelte.config.js` | Static adapter and preprocessing |

Local draft archives and design-review screenshots are excluded from this repository and are not published.

To change a rule, edit `evaluate()` and update the affected regression test. Results are `discuss`, `assess`, `unknown` or `not`; none means a person is cleared for treatment. `visual` determines whether a general mechanism plays. The `variant` field chooses resection versus transplant within the one Surgery button.

To edit artwork, start with `liverPath` in `artwork.ts` and the labelled SVG groups in `Anatomy.svelte`. The same liver outline appears in `OrganVignette.svelte` on screen one. Coordinates are in a 600 × 480 front-view space. The patient’s right appears on the viewer’s left. The lobe highlight, tumour size marker and count symbols respond to the inputs. Exact shapes, positions, relative size scaling, blood vessels and probe trajectory are teaching schematics, not patient anatomy. Additional dots have unknown sizes and illustrative positions. “4 or more” uses four symbols; diffuse disease uses a field pattern. Unknown location remains unplotted until a clearly labelled generic mechanism is selected.

Playback is a single eight-second sequence, with pause, resume, replay and a still view. The operating-system reduced-motion preference disables playback and zoom transitions. No treatment, result or motion appears when screen two opens. Returning to edit clears the previous selection.

## Clinical scope and sources

This is for **hepatocellular carcinoma (HCC)**, not all cancers found in the liver. The four interface groups are Surgery, Ablation, Artery treatment (TACE) and Medicines; they are not four official BCLC categories or an exhaustive treatment inventory.

The rule framework is a deliberately small subset of **Reig et al., BCLC 2022**, Journal of Hepatology 76:681–693, DOI [10.1016/j.jhep.2021.11.018](https://doi.org/10.1016/j.jhep.2021.11.018). The relevant material was verified in the [accessible paper](https://www.arganz.org/wp-content/uploads/2023/10/HCC-staging-and-treatment-2022-BCLC.pdf), especially the treatment sections and Figure 1 on pp. 682–686. [PMC copy](https://pmc.ncbi.nlm.nih.gov/articles/PMC8866082/).

The [2026 BCLC update](https://pubmed.ncbi.nlm.nih.gov/41151697/) exists, DOI 10.1016/j.jhep.2025.10.020; its PubMed record also identifies a June 2026 erratum. Full 2026 recommendations and the erratum have **not** been implemented or validated here. The optional “Why this result?” help states this distinction.

Treatment mechanism descriptions use the [National Cancer Institute treatment overview](https://www.cancer.gov/types/liver/what-is-liver-cancer/treatment).

Key implementation limits:

- Uncollected facts stay unknown. Liver function and cancer-related activity use broad categories, not a computed clinical score. No BCLC stage is assigned.
- The ≤3 cm single-tumour ablation example is a prototype boundary, not an absolute contraindication. A larger tumour receives an assessment-needed result. Size alone does not exclude surgery.
- Surgery groups resection and transplant; they do not have the same eligibility. The multiple-small-tumour branch illustrates transplant.
- TACE needs details absent from the form, so its general mechanism can accompany an assessment-needed result. It never implies verified artery accessibility or adequate portal flow. Bilobar disease alone is not labelled diffuse disease.
- Vessel invasion/spread and diffuse disease inform the systemic discussion. Impaired liver function or substantial activity limitations override simple mapping with individual assessment, including transplant eligibility and supportive care.
- Imaging, portal pressure, liver reserve, blood flow, transplant criteria, other illnesses, previous treatment and preferences require clinical review. No survival estimate, guaranteed response or actual procedure plan is provided.

## Review the prototype

Try “One small tumour” first. Screen two should open without a selected treatment. Explore Surgery and Ablation, zoom in, pause/replay or use Still view. Artery treatment explains missing assessment information; Medicines shows the simple-pathway reason.

Then try “Cancer with spread”: Medicines plays its mechanism, while local-treatment groups explain why this prototype’s initial pathway does not recommend them. “Start with unknown details” should leave location unplotted and show information-needed results only after a click. “Several liver tumours” tests count/bilobar rendering and TACE uncertainty.

The optional `explore_treatment` WebMCP tool is feature-detected; it selects one of the same four treatments only when the explorer is already open. Unsupported browsers retain all ordinary UI functionality.

This prototype needs clinician feedback on the rule subset, explanation granularity and artwork before any use beyond education and design review.
