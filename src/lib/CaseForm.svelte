<script lang="ts">
  import { onMount } from 'svelte';
  import OrganVignette from './OrganVignette.svelte';
  import FieldHelp from './FieldHelp.svelte';
  import { options, samples, validateCase, type CaseInput, type ChoiceKey } from './rules';
  let { value = $bindable(), onexplore }: { value: CaseInput; onexplore: () => void } = $props();
  let error = $state('');
  let sample = $state('');
  let ready = $state(false);
  onMount(() => { ready = true; });
  const labels: Record<ChoiceKey, string> = {
    count:'Number of tumours', region:'Affected liver region', liver:'Liver function',
    activity:'Cancer-related daily activity', invasion:'Cancer in major blood vessels?', spread:'Cancer outside the liver?'
  };
  const help: Partial<Record<ChoiceKey,string>> = {
    region:'Right and left refer to the person’s body.',
    liver:'Use the care team’s assessment; choose Not sure if unknown.',
    activity:'Use assessed ECOG status. If the cause of limitations is unclear, choose Not sure.'
  };
  function loadSample(key: string) { if(samples[key]) {value={...samples[key]};sample=key;error='';} }
  function submit(event: SubmitEvent) {
    event.preventDefault(); error=validateCase(value) ?? ''; if(!error) onexplore();
  }
</script>

<section class="case-screen" aria-labelledby="case-title">
  <form class="case-card" onsubmit={submit}>
    <div class="form-heading"><h1 id="case-title" tabindex="-1">Case details</h1><OrganVignette/></div>
    <div class="sample-box">
      <div class="field-label"><label for="sample">Example case</label><FieldHelp label="example cases" text="Examples are invented for testing, not patient records."/></div>
      <select id="sample" value={sample} disabled={!ready} onchange={e=>loadSample(e.currentTarget.value)}>
        <option value="" disabled>Try a fictional case</option>
        <option value="small">One small tumour</option>
        <option value="multiple">Several liver tumours</option>
        <option value="advanced">Cancer with spread</option>
        <option value="unknown">Start with unknown details</option>
      </select>
    </div>
    <div class="form-grid">
      {#each ['count','size','region','liver','activity','invasion','spread'] as field}
        {#if field === 'size'}
          <div class="field"><div class="field-label"><label for="size">Largest tumour size</label><FieldHelp label="largest tumour size" text="Leave blank if unknown."/></div><div class="unit-input"><input id="size" type="number" min="0.1" max="30" step="0.1" placeholder="Not sure" disabled={!ready} value={value.size} oninput={e=>{value={...value,size:e.currentTarget.value};sample='';error='';}} /><span>cm</span></div></div>
        {:else}
          {@const key = field as ChoiceKey}
          <div class:wide={key==='activity'} class="field">
            <div class="field-label"><label for={key}>{labels[key]}</label>{#if help[key]}<FieldHelp label={labels[key].toLowerCase()} text={help[key] ?? ''}/>{/if}</div>
            <select id={key} value={value[key]} disabled={!ready} onchange={e=>{value={...value,[key]:e.currentTarget.value};sample='';error='';}}>
              {#each options[key] as [val,label]}<option value={val}>{label}</option>{/each}
            </select>
          </div>
        {/if}
      {/each}
    </div>
    {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    <div class="form-bottom"><details class="form-help"><summary>Help</summary><p>For learning about hepatocellular carcinoma (HCC). Choose “Not sure” for unknown details. No names or personal details are needed, and case data is not saved or sent.</p></details><button class="primary" type="submit" disabled={!ready}>Explore treatments <span aria-hidden="true">↗</span></button></div>
  </form>
</section>
