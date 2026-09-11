<script lang="ts">
  import { fade } from 'svelte/transition';
  import { explanation, treatments, type TreatmentId, type TreatmentResult } from './rules';
  let {selected, result, reduced=false}: {selected: TreatmentId | null; result: TreatmentResult | null; reduced?: boolean} = $props();
  const statuses={discuss:'An option to discuss',assess:'Needs clinical assessment',unknown:'More information needed',not:'Not recommended in this simple pathway'};
</script>

<div class="explanation-slot" aria-live="polite" aria-atomic="true">
  {#if selected && result}
    {#key selected}
      <section class="treatment-panel" in:fade={{duration:reduced?0:180}} aria-labelledby="treatment-heading">
        <h2 id="treatment-heading">{treatments.find(t=>t.id===selected)?.name}</h2>
        <div class="assessment" class:discussion={result.status==='discuss'} data-status={result.status}>
          <h3>{statuses[result.status]}</h3><p>{result.reason}</p>
        </div>
        {#each explanation[selected] as paragraph}<p class="treatment-copy">{paragraph}</p>{/each}
        <details class="rule-details"><summary>Why this result?</summary><p>{result.rule}</p><p>Educational <a href="https://doi.org/10.1016/j.jhep.2021.11.018" target="_blank" rel="noreferrer">BCLC 2022</a> subset; the 2026 update is not implemented. These inputs do not establish personal eligibility.</p><p>Mechanisms: <a href="https://www.cancer.gov/types/liver/what-is-liver-cancer/treatment" target="_blank" rel="noreferrer">National Cancer Institute</a>.</p></details>
      </section>
    {/key}
  {:else}
    <div class="empty-explanation"><span class="empty-symbol" aria-hidden="true">✳</span><p>Choose a treatment to see how it works.</p></div>
  {/if}
</div>
