<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { base } from '$app/paths';
  import CaseForm from '$lib/CaseForm.svelte';
  import Anatomy from '$lib/Anatomy.svelte';
  import TreatmentIcon from '$lib/TreatmentIcon.svelte';
  import { cloneCase, aggregate } from '$lib/tumours';
  import { blankCase, evaluate, treatments, type CaseInput, type TreatmentId, type TreatmentResult } from '$lib/rules';

  let screen=$state<'case'|'explore'>('case');
  let value=$state<CaseInput>(cloneCase(blankCase));
  let selected=$state<TreatmentId|null>(null);
  let result=$state<TreatmentResult|null>(null);
  let reduced=$state(false);
  let explorerHeading = $state<HTMLHeadingElement>();
  let totals=$derived(aggregate(value));
  let caseSummary=$derived(value.pattern==='diffuse'?'Diffuse pattern':value.tumours.length?`${value.tumours.length} recorded · ${totals.complete?'Complete list':'Total count unknown'}`:'Tumour details unknown');
  async function explore() {
    selected=null;result=null;screen='explore';
    history.pushState({explorer:true},'', '#explore');
    await tick();explorerHeading?.focus();window.scrollTo(0,0);
  }
  async function edit() {
    selected=null;result=null;screen='case';
    history.replaceState({},'',location.pathname);await tick();
    document.getElementById('case-title')?.focus();window.scrollTo(0,0);
  }
  function choose(id: TreatmentId) {selected=id;result=evaluate(value,id);}
  onMount(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>reduced=media.matches;change();media.addEventListener('change',change);
    // A refreshed page starts with unknown values; case data never enters the URL.
    history.replaceState({},'',location.pathname);
    const back=()=>{selected=null;result=null;screen='case';};window.addEventListener('popstate',back);
    // Optional browser-native agent interface; it uses the same visible actions.
    const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:unknown)=>unknown}}).modelContext;
    const lifecycle=new AbortController();
    if(context?.registerTool) {
      try {
        Promise.resolve(context.registerTool({name:'explore_treatment',description:'Select one treatment for the currently visible case. Requires the treatment explorer screen. Assessment uses the complete current case; selecting this tool does not choose a target or advance the illustrative sequence.',inputSchema:{type:'object',properties:{treatment:{type:'string',enum:treatments.map(t=>t.id)}},required:['treatment'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:{treatment:string})=>{
          if(screen!=='explore') throw new Error('Enter a case and open the explorer first.');
          if(!input||Object.keys(input).length!==1||!treatments.some(t=>t.id===input.treatment)) throw new Error('Choose one of the four listed treatments.');
          choose(input.treatment as TreatmentId);await tick();return {treatment:selected,result:result?{...result}:null};
        }},{signal:lifecycle.signal})).catch(()=>{});
      } catch { /* Optional API; UI is fully functional without it. */ }
    }
    return ()=>{lifecycle.abort();media.removeEventListener('change',change);window.removeEventListener('popstate',back);};
  });
</script>

<svelte:head><title>Liver Lens · Liver treatment explorer</title><meta name="description" content="Liver Lens is an educational prototype for exploring liver cancer treatments."/></svelte:head>
<header class="topbar"><button class="brand" onclick={edit} aria-label="Liver Lens, edit case"><img class="brand-mark" src={`${base}/favicon.svg`} alt=""/><span>Liver Lens</span><span class="brand-divider"></span><span class="brand-sub">Liver treatment explorer</span></button><span class="prototype">Educational prototype</span></header>
<main>
  {#if screen==='case'}
    <CaseForm bind:value onexplore={explore}/>
  {:else}
    <section class="explorer" aria-labelledby="explorer-title" in:fade={{duration:reduced?0:200}}>
      <div class="explorer-top"><h1 id="explorer-title" tabindex="-1" bind:this={explorerHeading}>Explore the liver.</h1><button class="quiet-button edit-button" onclick={edit}>← Edit case</button></div>
      <p class="case-summary">{caseSummary}</p>
      <div class="treatment-buttons" aria-label="Treatments">
        {#each treatments as treatment}
          <button class="treatment-button" class:selected={selected===treatment.id} aria-pressed={selected===treatment.id} onclick={()=>choose(treatment.id)}><TreatmentIcon id={treatment.id}/><span>{treatment.name}</span></button>
        {/each}
      </div>
      <Anatomy {value} {selected} {result} {reduced}/>
    </section>
  {/if}
</main>
