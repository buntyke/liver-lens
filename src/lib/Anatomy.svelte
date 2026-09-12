<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { untrack } from 'svelte';
  import { tumourPositions, selectedTumour } from './tumours';
  import TreatmentPanel from './TreatmentPanel.svelte';
  import { treatments, type CaseInput, type TreatmentId, type TreatmentResult } from './rules';
  let {value,selected,result,reduced=false}:{value:CaseInput;selected:TreatmentId|null;result:TreatmentResult|null;reduced?:boolean}=$props();
  let targetId=$state<string|null>(null),focus=$state(false),artery=$state(true),portal=$state(false),veins=$state(false),still=$state(false);
  let step=$state(0),surgery=$state<'resection'|'transplant'>('resection');
  const progress=tweened(0,{duration:700,easing:cubicInOut});
  const view=tweened({x:0,y:0,w:840,h:590},{duration:450,easing:cubicInOut});
  const shape='M146 202 C145 151 180 125 240 126 C315 115 372 139 427 155 C483 171 550 151 619 165 C681 169 714 180 690 213 C657 251 608 293 544 309 C487 325 443 305 410 344 C367 395 313 433 248 422 C172 418 132 336 146 202Z';
  let points=$derived(tumourPositions(value.tumours));
  let current=$derived(selectedTumour(value,targetId));
  let point=$derived(points.find(t=>t.id===current?.id));
  let generic=$derived(!point?.placed);
  let tx=$derived(point?.placed?point.x:280),ty=$derived(point?.placed?point.y:210),radius=$derived(point?.r??19);
  let p=$derived($progress),heat=$derived(Math.max(0,Math.min(1,p-1)));
  let mode=$derived(selected==='surgery'?surgery:selected);
  const steps:Record<string,string[]>={
    ablation:['Choose a tumour to explore.','A schematic probe reaches the target.','Heat creates a local treatment zone.','Imaging checks the treated area; response varies.'],
    artery:['Choose a tumour and reveal its arterial supply.','A catheter follows a tumour-feeding artery.','Medicine and particles travel along that artery.','Particles reduce the target’s arterial supply.'],
    resection:['Choose a tumour to explore.','A tumour-bearing portion is outlined.','That portion is removed in this example.','The remaining liver and other lesions need review.'],
    transplant:['Explore replacement of the liver.','The diseased liver is identified.','The liver is removed in this example.','A donated liver replaces it; follow-up continues.'],
    medicines:['Explore treatment throughout the body.','Medicine enters the bloodstream.','Treatment circulates beyond the liver.','Treatment acts against cancer; response varies.']
  };
  const actions:Record<string,string[]>={ablation:['Place probe','Show heat','Review zone'],artery:['Trace catheter','Deliver particles','See the effect'],resection:['Outline portion','Remove portion','Review what remains'],transplant:['Identify liver','Remove liver','Show donated liver'],medicines:['Introduce medicine','Follow circulation','See the effect']};
  let caption=$derived(mode?steps[mode][Math.round(step)]:'Choose a treatment above.');
  let isWhole=$derived(mode==='medicines'||mode==='transplant');
  let arteryVisible=$derived(artery||selected==='artery');
  let arteryPath=$derived(`M410 476 L410 345 C410 ${ty+60} ${tx+55} ${ty+60} ${tx} ${ty+radius}`);
  function route(t:number){if(t<.3)return{x:410,y:476-(131*t/.3)};const u=(t-.3)/.7,v=1-u;return{x:v*v*v*410+3*v*v*u*410+3*v*u*u*(tx+55)+u*u*u*tx,y:v*v*v*345+3*v*v*u*(ty+60)+3*v*u*u*(ty+60)+u*u*u*(ty+radius)};}
  function go(next:number,scrub=false){step=Math.max(0,Math.min(3,next));void progress.set(step,{duration:reduced||still||scrub?0:700});}
  function selectTarget(id:string){targetId=id;go(0);}
  function keyTarget(e:KeyboardEvent,id:string){if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTarget(id);}}
  $effect(()=>{const id=selected;const target=current?.id;untrack(()=>{if(id==='surgery')surgery=result?.variant??'resection';go(0);});});
  $effect(()=>{const instant=reduced||still;if(instant)untrack(()=>void progress.set(step,{duration:0}));});
  $effect(()=>{const close=focus&&!isWhole;const x=tx,y=ty;void view.set(close?{x:Math.max(100,x-170),y:Math.max(70,y-140),w:340,h:280}:{x:0,y:0,w:840,h:590},{duration:reduced||still?0:450});});
</script>

<div class="explorer-grid">
  <section class="anatomy-card" aria-labelledby="anatomy-heading">
    <div class="anatomy-toolbar"><div><span class="section-kicker">{selected?'INTERACTIVE MECHANISM':'ANATOMY VIEW'}</span><h2 id="anatomy-heading">{selected?treatments.find(t=>t.id===selected)?.name:'Your liver picture'}</h2></div><button class="quiet-button" aria-pressed={focus} disabled={isWhole} onclick={()=>focus=!focus}>{focus?'Show whole liver':'Focus on target'}</button></div>
    <div class="vessel-controls" aria-label="Vessel layers"><button class="vessel-chip arterial" aria-pressed={arteryVisible} disabled={selected==='artery'} onclick={()=>artery=!artery}><i></i>Hepatic artery <span>in ↑</span></button><button class="vessel-chip portal" aria-pressed={portal} onclick={()=>portal=!portal}><i></i>Portal vein <span>in ↑</span></button><button class="vessel-chip venous" aria-pressed={veins} onclick={()=>veins=!veins}><i></i>Hepatic veins <span>out ↑</span></button></div>
    {#if selected==='surgery'}<div class="surgery-options" aria-label="Surgery mechanism"><button aria-pressed={surgery==='resection'} onclick={()=>{surgery='resection';go(0)}}>Resection</button><button aria-pressed={surgery==='transplant'} onclick={()=>{surgery='transplant';go(0)}}>Transplant</button><span>Mechanism only</span></div>{/if}
    <div class="anatomy-canvas">
      <svg class="liver-stage" viewBox={`${$view.x} ${$view.y} ${$view.w} ${$view.h}`} role="group" aria-labelledby="anatomy-title anatomy-desc">
        <title id="anatomy-title">Liver, recorded tumours and labelled vessel layers</title><desc id="anatomy-desc">Front view: the person’s right is on the left. Tumour positions and vessel branches are schematic. {value.tumours.length} recorded tumours. Unknown lobe locations appear below the liver. {selected?caption:''}</desc>
        <defs>
          <radialGradient id="liver-paint" cx="34%" cy="24%" r="85%"><stop offset="0" stop-color="#c77f68"/><stop offset=".45" stop-color="#ab584c"/><stop offset="1" stop-color="#713b38"/></radialGradient>
          <radialGradient id="tumour-paint" cx="30%" cy="26%"><stop stop-color="#f4ddb2"/><stop offset=".55" stop-color="#d7ad75"/><stop offset="1" stop-color="#a7754d"/></radialGradient>
          <radialGradient id="heat-paint"><stop stop-color="#ffe9a5" stop-opacity=".82"/><stop offset=".65" stop-color="#edb459" stop-opacity=".65"/><stop offset="1" stop-color="#db7559" stop-opacity=".08"/></radialGradient>
          <linearGradient id="probe-paint"><stop stop-color="#365363"/><stop offset=".5" stop-color="#eff8ff"/><stop offset="1" stop-color="#456577"/></linearGradient>
          <pattern id="lesion-texture" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M1 7L7 1" stroke="#775237" stroke-width="1" opacity=".55"/><circle cx="6" cy="7" r="1.1" fill="#fff1d8"/></pattern>
          <pattern id="diffuse-pattern" width="29" height="29" patternUnits="userSpaceOnUse"><circle cx="8" cy="13" r="5" fill="#cba77a" opacity=".75"/><circle cx="22" cy="25" r="3" fill="#efca92" opacity=".6"/></pattern>
          <clipPath id="organ-clip"><path d={shape}/></clipPath>
          <clipPath id="resection-piece"><circle cx={tx} cy={ty} r={radius+32}/></clipPath>
          <marker id="arterial-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#c2494a"/></marker>
          <marker id="portal-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#247daa"/></marker>
          <marker id="venous-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#5863ad"/></marker>
        </defs>
        <!-- Surrounding anatomy is subdued so the liver and vessels stay legible. -->
        <path d="M282 44C250 89 155 83 121 151C97 212 104 283 88 351C85 435 154 480 215 499L625 499C699 473 747 423 748 354C726 287 742 205 711 151C674 92 593 89 558 44" fill="#e0d2c8" fill-opacity=".24" stroke="#b1c6d1" stroke-width="2"/>
        <path d="M546 146L546 232C600 208 650 243 626 297C602 351 539 373 493 347C459 326 472 291 503 287C539 282 523 242 527 147" fill="#d3a295" fill-opacity=".5" stroke="#b6978f" stroke-width="2"/>
        <path d="M519 361C467 344 431 353 399 357C379 353 356 362 367 377C408 393 460 380 489 385C525 389 541 370 519 361" fill="#d9c592" fill-opacity=".7" stroke="#b6a57c" stroke-width="2"/>
        <g opacity={mode==='transplant'?1-Math.min(1,Math.max(0,p-1)):1}>
          <path d={shape} transform="translate(0 7)" fill="#566a7b" opacity=".14"/>
          <path d={shape} fill="url(#liver-paint)" stroke="#683e3b" stroke-width="2.8"/>
          <g clip-path="url(#organ-clip)"><path d="M150 255C229 172 276 164 390 188C514 225 610 165 696 186" fill="none" stroke="#f1b296" stroke-width="32" opacity=".13"/><path d="M426 155C409 200 427 244 407 280C389 309 404 329 383 367" fill="none" stroke="#6e3939" stroke-width="4" opacity=".55"/><path d="M173 188C187 157 221 147 263 148" fill="none" stroke="#f1b39b" stroke-width="6" opacity=".6"/>
            {#if value.pattern==='diffuse'}<path d={shape} fill="url(#diffuse-pattern)"/>{/if}
          </g>
          <path d="M397 324C424 343 422 380 398 384C377 386 376 354 397 324Z" fill="#86966a" stroke="#51684d" stroke-width="2.5"/>
          <!-- Separate circulation trees: portal inflow, venous outflow, arterial inflow. -->
          {#if portal}<g class="vessel-tree" stroke-linecap="round" fill="none"><path d="M452 476L452 350Q440 311 376 292Q307 279 260 229M430 321Q513 306 591 222" stroke="#24688f" stroke-width="14"/><path d="M452 476L452 350Q440 311 376 292Q307 279 260 229M430 321Q513 306 591 222" stroke="#62acd0" stroke-width="8"/><path d="M346 285Q316 324 248 348M302 261L214 222M514 284L546 227M559 253L634 232M284 246L291 184M307 315L327 365" stroke="#4c9ac3" stroke-width="6"/><path d="M452 446L452 401" stroke="#247daa" stroke-width="2" marker-end="url(#portal-arrow)"/></g>{/if}
          {#if veins}<g class="vessel-tree" fill="none" stroke-linecap="round"><path d="M437 77L437 160Q431 213 360 220Q300 226 217 299M431 178Q488 219 578 249M435 165L468 291" stroke="#48518e" stroke-width="12"/><path d="M437 77L437 160Q431 213 360 220Q300 226 217 299M431 178Q488 219 578 249M435 165L468 291" stroke="#959ed7" stroke-width="6"/><path d="M302 244L265 194M351 221L339 169M505 227L557 195M468 262L520 274M264 273L267 321" stroke="#7e89c5" stroke-width="5"/><path d="M437 134L437 96" stroke="#5863ad" stroke-width="2" marker-end="url(#venous-arrow)"/></g>{/if}
          {#if arteryVisible}<g class="vessel-tree" fill="none" stroke-linecap="round"><path d="M410 476L410 345Q387 312 314 288Q270 267 233 196M393 323Q503 269 612 208" stroke="#8b363b" stroke-width="9"/><path d="M410 476L410 345Q387 312 314 288Q270 267 233 196M393 323Q503 269 612 208" stroke="#e48379" stroke-width="4.5"/><path d="M313 287L228 302M284 269L260 340M271 248L305 205M510 262L523 216M564 235L629 250M244 219L207 223" stroke="#d56b66" stroke-width="4"/><path d="M410 446L410 407" stroke="#c2494a" stroke-width="2" marker-end="url(#arterial-arrow)"/>
            {#if selected==='artery'}<path d={arteryPath} stroke="#973f43" stroke-width="10"/><path d={arteryPath} stroke="#f09a83" stroke-width="5"/>{/if}
          </g>{/if}
          {#each points.filter(t=>t.placed) as t (t.id)}
            <g class="tumour-marker" role="button" tabindex="0" aria-label={`Select ${t.id}, ${t.size||'unknown'} cm, ${t.region} lobe`} aria-pressed={current?.id===t.id} onclick={()=>selectTarget(t.id)} onkeydown={e=>keyTarget(e,t.id)}>
              <circle cx={t.x} cy={t.y} r={Math.max(23,t.r+10)} fill="transparent"/>
              {#if current?.id===t.id}<circle class="target-ring" cx={t.x} cy={t.y} r={t.r+8} fill="none" stroke="#e6faff" stroke-width="2" stroke-dasharray="4 4"/>{/if}
              <circle cx={t.x} cy={t.y} r={t.r} fill="url(#tumour-paint)" stroke="#735438" stroke-width="2" stroke-dasharray={t.size===''?'3 3':undefined}/><circle cx={t.x} cy={t.y} r={t.r} fill="url(#lesion-texture)"/>
              <rect x={t.x-15} y={t.y-t.r-27} width="30" height="21" rx="7" fill={current?.id===t.id?'#174d65':'#f6f4df'}/><text x={t.x} y={t.y-t.r-12} text-anchor="middle" fill={current?.id===t.id?'white':'#354957'} font-size="13" font-weight="700">{t.id}</text>
            </g>
          {/each}
        </g>
        {#if mode==='transplant'&&p>0&&p<2}<path d={shape} fill="none" stroke="#d2fff1" stroke-width="5" stroke-dasharray="8 5" opacity={Math.min(1,p)}/>{/if}
        {#if mode==='transplant'&&p>2}<g opacity={Math.min(1,p-2)}><path d={shape} fill="url(#liver-paint)" stroke="#683e3b" stroke-width="3"/><path d="M426 155Q395 244 408 321" stroke="#713f3c" stroke-width="3" fill="none"/><text x="365" y="255" fill="#fff6ea" font-size="22" font-weight="600" text-anchor="middle">Donated liver</text></g>{/if}
        {#if selected&&generic&&!isWhole}<g><circle cx={tx} cy={ty} r={radius} fill="url(#tumour-paint)" stroke="#735438" stroke-width="2" stroke-dasharray="4 4"/><text x={tx} y={ty-radius-15} text-anchor="middle" fill="#fff6ea" font-size="15">{current?.id??'Example'} · generic site</text></g>{/if}
        {#if mode==='ablation'&&p>0}
          {#if heat>0}<ellipse cx={tx} cy={ty} rx={(radius+22)*heat} ry={(radius+13)*heat} transform={`rotate(45 ${tx} ${ty})`} fill="url(#heat-paint)" stroke="#e5ad5d" stroke-width="2" stroke-dasharray="5 4"/>{/if}
          <g transform={`translate(${-75*(1-Math.min(1,p))} ${-75*(1-Math.min(1,p))})`} opacity={Math.min(1,p*3)}><path d={`M${tx-110} ${ty-110}L${tx+5} ${ty+5}`} stroke="#314b5c" stroke-width="7"/><path d={`M${tx-110} ${ty-110}L${tx+5} ${ty+5}`} stroke="url(#probe-paint)" stroke-width="4"/><path d={`M${tx-130} ${ty-130}L${tx-106} ${ty-106}`} stroke="#284c62" stroke-width="17" stroke-linecap="round"/><path d={`M${tx-8} ${ty-8}L${tx+5} ${ty+5}`} stroke="#fcf1ca" stroke-width="3"/></g>
          {#if p>2.6}<path d={`M${tx-radius-28} ${ty-15}v-25h25M${tx+radius+28} ${ty+15}v25h-25`} fill="none" stroke="#daeff8" stroke-width="3"/>{/if}
        {:else if mode==='artery'&&p>0}
          <path d={arteryPath} fill="none" stroke="#243f50" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset={1-Math.min(.72,p*.72)}/><path d={arteryPath} fill="none" stroke="#e8eff2" stroke-width="2" pathLength="1" stroke-dasharray="1" stroke-dashoffset={1-Math.min(.72,p*.72)}/>
          {#if p>1}{#each Array(10) as _,i}{@const pos=route(Math.max(.72,Math.min(.9+i*.009,.72+(p-1)*.4-i*.024)))}<circle cx={pos.x} cy={pos.y} r="3.5" fill="#f7d77b" stroke="#805f35" stroke-width="1"/>{/each}{/if}
          {#if p>2}<circle cx={tx} cy={ty} r={radius+9} fill="none" stroke="#edc572" stroke-width="3" stroke-dasharray="3 5" opacity={p-2}/>{/if}
        {:else if mode==='resection'&&p>0}
          <circle cx={tx} cy={ty} r={radius+31} fill={p>1?'#e7f1f5':'transparent'} stroke="#ecf9ff" stroke-width="2" stroke-dasharray="7 5" opacity={Math.min(1,p)}/>
          <g transform={`translate(${-Math.min(1,Math.max(0,p-1))*95} ${-Math.min(1,Math.max(0,p-1))*58})`}><g clip-path="url(#resection-piece)"><path d={shape} fill="url(#liver-paint)" stroke="#754740" stroke-width="2"/><circle cx={tx} cy={ty} r={radius} fill="url(#tumour-paint)" stroke="#735438" stroke-width="2"/><circle cx={tx} cy={ty} r={radius} fill="url(#lesion-texture)"/></g><circle cx={tx} cy={ty} r={radius+31} fill="none" stroke="#fff5df" stroke-width="2" stroke-dasharray="7 5"/></g>
        {:else if mode==='medicines'&&p>0}
          <path d="M753 143V319C753 408 661 448 558 457C493 471 481 446 476 398M748 240Q652 345 550 265" fill="none" stroke="#42a1af" stroke-width="9" opacity=".7"/>
          <g transform="translate(729 83)"><rect width="47" height="65" rx="12" fill="#e2f5f7" stroke="#568a9b" stroke-width="2"/><path d="M10 26H37V50Q24 59 10 50Z" fill="#65b5c1"/><path d="M24 4V19M17 11H31" stroke="#53838e" stroke-width="2"/></g>
          {#each Array(9) as _,i}{@const v=Math.max(0,Math.min(1,(p-.5)/1.5-i*.045))}<circle cx={v<.4?753:753-(v-.4)/.6*276} cy={v<.4?154+v/.4*170:324+Math.sin((v-.4)/.6*Math.PI/2)*114} r="5" fill="#d7f9f0" stroke="#2b8b9d" stroke-width="1.5"/>{/each}
          {#if p>2}{#each points.filter(t=>t.placed) as t}<circle cx={t.x} cy={t.y} r={t.r+13} fill="none" stroke="#9ce3d5" stroke-width="3" stroke-dasharray="3 6" opacity={p-2}/>{/each}<circle cx="720" cy="371" r="28" fill="none" stroke="#3996a6" stroke-width="2" stroke-dasharray="3 5"/>{/if}
          <text x="703" y="495" text-anchor="middle" fill="#347789" font-size="16">Beyond the liver</text>
        {/if}
        {#if !focus||isWhole}<g fill="#607d8c" font-size="15"><text x="140" y="98">PERSON’S RIGHT</text><text x="557" y="123">PERSON’S LEFT</text>{#if veins}<text x="452" y="86" fill="#5966a5">To the heart ↑</text>{/if}{#if arteryVisible||portal}<text x="326" y="500">Blood enters ↑</text>{/if}</g>{/if}
        {#if points.some(t=>!t.placed)&&(!focus||isWhole)}<text x="36" y="511" fill="#546f7e" font-size="13">UNMAPPED · LOBE UNKNOWN</text>{#each points.filter(t=>!t.placed) as t,i}<g role="button" tabindex="0" class="tumour-marker" aria-label={`Select ${t.id}, location unknown`} aria-pressed={current?.id===t.id} onclick={()=>selectTarget(t.id)} onkeydown={e=>keyTarget(e,t.id)}><rect x={36+i%6*130} y={522+Math.floor(i/6)*32} width="119" height="28" rx="7" fill={current?.id===t.id?'#d6edf2':'#f7fafb'} stroke="#91b6c8" stroke-dasharray="3 3"/><text x={44+i%6*130} y={541+Math.floor(i/6)*32} fill="#426a7e" font-size="13">{t.id} · {t.size?`${t.size} cm`:'size ?'}</text></g>{/each}{/if}
        {#if value.pattern==='diffuse'&&!focus}<text x="250" y="463" fill="#536e7d" font-size="16">Diffuse pattern · no individual target mapped</text>{/if}
      </svg>
      <div class:with-unmapped={points.some(t=>!t.placed)} class="scene-badge">{selected?(generic&&!isWhole?'Generic site · mechanism only':'Mechanism only'):'Schematic · front view'}</div>
    </div>
    <div class="stage-controls">
      {#if selected&&mode}
        <div class="step-track" aria-label="Mechanism steps">{#each [0,1,2,3] as n}<button class:current={Math.round(step)===n} aria-label={`Step ${n+1}: ${steps[mode][n]}`} aria-current={Math.round(step)===n?'step':undefined} onclick={()=>go(n)}>{n+1}</button>{/each}<span class="step-line"></span></div>
        <p class="stage-caption" aria-live="polite">{caption}</p>
        <label class="scrubber"><span class="sr-only">Mechanism progress</span><input aria-label="Mechanism progress" type="range" min="0" max="3" step="0.01" value={step} oninput={e=>go(Number(e.currentTarget.value),true)}/></label>
        <div class="playback"><button class="quiet-button" onclick={()=>go(0)}>↺ Reset</button><label class="still-control"><input type="checkbox" checked={still||reduced} disabled={reduced} onchange={e=>still=e.currentTarget.checked}/>{reduced?'Reduced motion':'Still steps'}</label><button class="primary" disabled={step>=3} onclick={()=>go(Math.min(3,Math.floor(step)+1))}>{step>=3?'Sequence complete':actions[mode][Math.floor(step)]} <span aria-hidden="true">→</span></button></div>
      {:else}<p class="neutral-caption">Choose a treatment. Then explore it, one step at a time.</p>{/if}
    </div>
    <details class="diagram-help"><summary>How to read this picture</summary><p>Original scalable drawing, not imaging or a procedure plan. Vessel colours identify separate pathways, not their literal appearance. Artery and portal vein bring blood in; hepatic veins drain blood towards the heart. Branches, probe entry and zone shape are illustrative, not safe routes or measured margins.</p><p>Recorded sizes share a schematic diameter scale; the smallest dots are enlarged for visibility. Same-area lesions may overlap: every recorded lesion remains selectable in the list. Unknown positions use a labelled generic site only during a local mechanism. Other recorded lesions remain separate. A resection circle represents a portion of tissue, not an operative cut. No sequence predicts complete tumour response.</p></details>
  </section>
  <aside class="case-inspector" aria-label="Tumour details">
    <div class="inspector-heading"><h2>{isWhole?'Whole liver & body':'Choose a target'}</h2><span>{value.tumours.length} recorded</span></div>
    {#if !value.tumours.length}<div class="empty-target"><span class="outline-orb">?</span><p>{value.pattern==='diffuse'?'Diffuse pattern':'No lesions recorded'}</p><small>Local mechanisms use a labelled example.</small></div>{/if}
    <div class="target-list">{#each value.tumours as t}<button class="target-card" class:active={current?.id===t.id} aria-pressed={current?.id===t.id} onclick={()=>selectTarget(t.id)}><span class="target-label">{t.id}</span><span><strong>{t.size?`${t.size} cm`:'Size unknown'}</strong><small>{t.region==='unknown'?'Lobe unknown':`${t.region==='right'?'Right':'Left'} lobe`}{t.level!=='unknown'?` · ${t.level}`:' · area unknown'}</small></span><span class="target-check" aria-hidden="true">{current?.id===t.id?'✓':'○'}</span></button>{/each}</div>
    {#if value.pattern==='listed'&&value.coverage!=='complete'}<p class="list-note">{value.coverage==='partial'?'More tumours exist.':'Full count unknown.'} Only recorded lesions are drawn.</p>{/if}
    {#if selected&&!isWhole&&current}<p class="target-context"><strong>{current.id}</strong> is the illustration target. {Math.max(0,value.tumours.length-1)} other recorded {value.tumours.length===2?'lesion remains':'lesions remain'}.</p>{/if}
    <TreatmentPanel {selected} {result}/>
  </aside>
</div>
