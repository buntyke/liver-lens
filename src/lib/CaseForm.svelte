<script lang="ts">
  import { onMount, tick } from 'svelte';
  import OrganVignette from './OrganVignette.svelte';
  import FieldHelp from './FieldHelp.svelte';
  import { options, samples, validateCase, type CaseInput, type ChoiceKey } from './rules';
  import { addTumour, removeTumour, cloneCase, MAX_TUMOURS, type Tumour } from './tumours';
  let {value=$bindable(),onexplore}: {value:CaseInput;onexplore:()=>void}=$props();
  let error=$state(''),sample=$state(''),ready=$state(false);
  onMount(()=>{ready=true});
  const labels: Record<ChoiceKey,string>={liver:'Liver function',activity:'Cancer-related daily activity',invasion:'Cancer in major blood vessels?',spread:'Cancer outside the liver?'};
  const help: Partial<Record<ChoiceKey,string>>={liver:'Use the care team’s assessment. Choose Not sure if unknown.',activity:'Use assessed ECOG status. If the cause of limitations is unclear, choose Not sure.'};
  function update(id:string,field:keyof Omit<Tumour,'id'>,next:string){value={...value,tumours:value.tumours.map(t=>t.id===id?{...t,[field]:next}:t)};sample='';error='';}
  async function add(){value=addTumour(value);sample='';await tick();document.getElementById(`size-${value.tumours.at(-1)?.id}`)?.focus();}
  async function remove(id:string){value=removeTumour(value,id);sample='';await tick();document.getElementById('add-tumour')?.focus();}
  function pattern(next:CaseInput['pattern']){value=next==='listed'?addTumour({...value,tumours:[]}):{...value,pattern:next,tumours:[],coverage:'unknown'};sample='';error='';}
  function submit(e:SubmitEvent){e.preventDefault();error=validateCase(value)??'';if(!error)onexplore();}
</script>
<section class="case-screen" aria-labelledby="case-title">
  <div class="case-title-row"><div><span class="section-kicker">YOUR EXPLORATION</span><h1 id="case-title" tabindex="-1">Build a liver picture.</h1></div><OrganVignette/></div>
  <form onsubmit={submit}>
    <div class="case-columns">
      <section class="case-card lesion-card" aria-labelledby="tumours-title">
        <div class="card-title"><h2 id="tumours-title">Tumours</h2><span class="count-pill">{value.tumours.length} recorded</span></div>
        <div class="sample-box"><label for="sample">Try an example</label><select id="sample" value={sample} disabled={!ready} onchange={e=>{value=cloneCase(samples[e.currentTarget.value]);sample=e.currentTarget.value;error=''}}><option value="" disabled>Fictional cases</option><option value="small">One small tumour</option><option value="multiple">Four different tumours</option><option value="advanced">Cancer with spread</option><option value="unknown">Unknown details</option></select></div>
        <div class="field"><div class="field-label"><label for="pattern">Tumour pattern</label><FieldHelp label="tumour pattern" text="Record individual lesions if known. Diffuse disease is an infiltrative pattern, not another name for several tumours. Examples are fictional."/></div><select id="pattern" value={value.pattern} disabled={!ready} onchange={e=>pattern(e.currentTarget.value as CaseInput['pattern'])}><option value="unknown">Not sure</option><option value="listed">Individual tumours</option><option value="diffuse">Diffuse / infiltrative disease</option></select></div>
        {#if value.pattern==='listed'}
          <div class="tumour-rows">
            {#each value.tumours as tumour (tumour.id)}
              <fieldset class="tumour-row"><legend>{tumour.id}</legend>
                <div class="lesion-fields">
                  <div class="field"><label for={`size-${tumour.id}`}>Size <span class="muted">cm</span></label><input id={`size-${tumour.id}`} aria-label={`${tumour.id} size in cm`} type="number" min="0.1" max="30" step="0.1" placeholder="Unknown" value={tumour.size} oninput={e=>update(tumour.id,'size',e.currentTarget.value)}/></div>
                  <div class="field"><label for={`region-${tumour.id}`}>Lobe</label><select id={`region-${tumour.id}`} aria-label={`${tumour.id} lobe`} value={tumour.region} onchange={e=>update(tumour.id,'region',e.currentTarget.value)}><option value="unknown">Not sure</option><option value="right">Right</option><option value="left">Left</option></select></div>
                  <div class="field"><label for={`level-${tumour.id}`}>Area</label><select id={`level-${tumour.id}`} aria-label={`${tumour.id} area`} value={tumour.level} onchange={e=>update(tumour.id,'level',e.currentTarget.value)}><option value="unknown">Not sure</option><option value="upper">Upper</option><option value="middle">Middle</option><option value="lower">Lower</option></select></div>
                </div>
                <button class="remove-button" type="button" aria-label={`Remove ${tumour.id}`} onclick={()=>remove(tumour.id)}>×</button>
              </fieldset>
            {/each}
          </div>
          <div class="field coverage"><div class="field-label"><label for="coverage">Is this the full tumour list?</label><FieldHelp label="the tumour list" text="An incomplete list never counts as the total tumour burden. Up to 12 lesions can be drawn; if more exist, choose No, more exist. No lesions beyond the list are simulated."/></div><select id="coverage" value={value.coverage} onchange={e=>value={...value,coverage:e.currentTarget.value as CaseInput['coverage']}}><option value="unknown">Not sure</option><option value="complete">Yes, all recorded</option><option value="partial">No, more exist</option></select></div>
        {:else}<div class="empty-tumours"><span class="outline-orb">?</span><p>{value.pattern==='diffuse'?'A diffuse pattern will be shown.':'Add the tumours you know about.'}</p></div>{/if}
        {#if value.pattern!=='diffuse'}<button id="add-tumour" type="button" class="add-button" disabled={!ready||value.tumours.length>=MAX_TUMOURS} onclick={add}>+ Add tumour</button>{#if value.tumours.length>=MAX_TUMOURS}<p class="small-note">12-lesion drawing limit. Mark the list incomplete if more exist.</p>{/if}{/if}
        <details class="inline-help"><summary>Size & location help</summary><p>Leave unknown sizes blank. Left and right refer to the person’s body. Areas are approximate; they do not establish imaging coordinates, access or vessel distance. Sizes outside 0.1–30 cm are outside this drawing model.</p></details>
      </section>
      <section class="case-card context-card" aria-labelledby="context-title"><div class="card-title"><h2 id="context-title">The wider picture</h2><span class="mini-symbol">＋</span></div>
        <div class="context-fields">{#each ['liver','activity','invasion','spread'] as field}{@const key=field as ChoiceKey}<div class="field"><div class="field-label"><label for={key}>{labels[key]}</label>{#if help[key]}<FieldHelp label={labels[key].toLowerCase()} text={help[key]??''}/>{/if}</div><select id={key} value={value[key]} disabled={!ready} onchange={e=>{value={...value,[key]:e.currentTarget.value};sample='';error=''}}>{#each options[key] as [val,label]}<option value={val}>{label}</option>{/each}</select></div>{/each}</div>
        <details class="inline-help"><summary>About these details</summary><p>An educational HCC model. Choose Not sure for unknown facts. No names are needed, and case details are not saved or sent. Clinical assessment remains essential.</p></details>
      </section>
    </div>
    <div class="case-action">{#if error}<p class="form-error" role="alert">{error}</p>{/if}<button class="primary" disabled={!ready}>Explore this picture <span aria-hidden="true">→</span></button></div>
  </form>
</section>
