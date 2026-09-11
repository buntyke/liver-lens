<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicInOut, linear } from 'svelte/easing';
  import { get } from 'svelte/store';
  import { onDestroy } from 'svelte';
  import { liverPath } from './artwork';
  import type { CaseInput, TreatmentId, TreatmentResult } from './rules';
  let {value, selected, result, reduced=false}: {value: CaseInput; selected: TreatmentId|null; result: TreatmentResult|null; reduced?: boolean}=$props();
  let zoomed=$state(false), paused=$state(false), staticMode=$state(false), finished=$state(false);
  const progress=tweened(0,{duration:8000,easing:linear});
  const view=tweened({x:0,y:0,w:600,h:480},{duration:450,easing:cubicInOut});
  let tx=$derived(value.region==='left'?358:210);
  let ty=$derived(value.region==='left'?156:181);
  let radius=$derived(value.size===''?12:6+Math.sqrt(Number(value.size))*4);
  let placed=$derived(value.region!=='unknown');
  let active=$derived(Boolean(selected&&result?.visual));
  let still=$derived(reduced||staticMode);
  let p=$derived(still?1:$progress);
  let targetX=$derived(placed?tx:210), targetY=$derived(placed?ty:181);
  let otherCount=$derived(value.count==='4+'?3:value.count==='2'?1:value.count==='3'?2:0);
  // Keep count symbols inside each lobe and separate from the largest marker.
  // These positions are compositional examples, never patient coordinates.
  let otherMarkers=$derived(value.region==='left'
    ? [{x:315,y:154},{x:388,y:149},{x:334,y:177}]
    : value.region==='both'
      ? [{x:352,y:156},{x:175,y:220},{x:250,y:151}]
      : [{x:175,y:220},{x:250,y:151},{x:166,y:158}]);
  let caption=$derived(!active?'':selected==='ablation'?(p<.4?'1 / A schematic probe approaches the tumour':p<.8?'2 / Heat creates a local treatment zone':'3 / The treated area is checked with follow-up imaging'):selected==='artery'?(p<.4?'1 / A catheter follows a tumour-feeding artery':p<.8?'2 / Medicine and particles reach that supply':'3 / Particles reduce blood flow to the tumour'):selected==='medicines'?(p<.4?'1 / Medicine enters the circulation':p<.8?'2 / Treatment travels through the bloodstream':'3 / Treatment acts against cancer; response varies'):result?.variant==='transplant'?(p<.5?'1 / The diseased liver is removed':'2 / A donated liver replaces it'):(p<.4?'1 / A tumour-bearing portion is identified':p<.8?'2 / That portion is removed':'3 / The remaining liver stays in place'));
  let run=0;
  async function replay() {
    const thisRun=++run; paused=false; finished=false;
    await progress.set(0,{duration:0});
    if(still) {finished=true; return;}
    await progress.set(1,{duration:8000});
    if(thisRun===run) finished=true;
  }
  function togglePause() {
    if(paused) {paused=false;const thisRun=++run;void progress.set(1,{duration:(1-get(progress))*8000}).then(()=>{if(run===thisRun)finished=true;});}
    else {++run;paused=true;void progress.set(get(progress),{duration:0});}
  }
  function zoom() {zoomed=!zoomed;void view.set(zoomed?{x:112,y:93,w:330,h:235}:{x:0,y:0,w:600,h:480},{duration:reduced?0:450});}
  $effect(()=>{const treatment=selected; const show=result?.visual; const noMotion=still;
    if(treatment&&show&&!noMotion) void replay();
    else {++run;void progress.set(show?1:0,{duration:0});finished=Boolean(show);paused=false;}
  });
  onDestroy(()=>{++run;void progress.set(get(progress),{duration:0});});
</script>

<section class="anatomy-card" aria-labelledby="anatomy-heading">
  <div class="anatomy-toolbar"><div><h2 id="anatomy-heading">{zoomed?'Liver':'Abdomen'}</h2></div><button class="quiet-button" onclick={zoom} aria-pressed={zoomed}>{zoomed?'− Abdomen view':'+ Zoom into liver'}</button></div>
  <div class="anatomy-canvas">
    <svg viewBox={`${$view.x} ${$view.y} ${$view.w} ${$view.h}`} role="img" aria-labelledby="anatomy-title anatomy-desc">
      <title id="anatomy-title">Front-view abdomen and liver schematic</title>
      <desc id="anatomy-desc">The person's right is on the left of this drawing. {value.region==='unknown'?'Tumour location is unknown.':value.region==='both'?'Both liver lobes are highlighted. Tumour positions are illustrative.':`The ${value.region} liver region is highlighted. Tumour positions are illustrative.`} {active?caption:''}</desc>
      <defs>
        <clipPath id="liver-clip"><path d={liverPath}/></clipPath>
        <pattern id="tumour-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#704b72" stroke-width="1.2" opacity=".55"/></pattern>
        <pattern id="diffuse-hatch" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3" fill="#785676" opacity=".7"/></pattern>
      </defs>
      <g class="organs" stroke-linecap="round" stroke-linejoin="round">
        <!-- Rounded silhouettes, a single ink colour and small painted highlights. -->
        <path d="M219 25 C202 48 161 49 139 82 C119 112 129 151 113 199 C98 240 104 296 118 344 C130 397 155 434 179 451 Q300 467 420 451 C450 420 473 381 483 339 C495 296 499 242 484 200 C471 160 480 111 458 82 C436 52 397 48 379 25" fill="#efcfac" stroke="#967154" stroke-width="3.5"/>
        <path d="M221 34 Q298 77 376 34 M147 99 Q172 86 195 87 M448 99 Q425 87 403 87" fill="none" stroke="#bc9873" stroke-width="3"/>
        <path d="M162 238 C142 237 136 264 145 288 C153 309 177 307 182 291 C185 280 170 280 171 269 C172 255 181 240 162 238 Z" fill="#bd9190" stroke="#715047" stroke-width="3.5"/>
        <path d="M438 238 C458 237 464 264 455 288 C447 309 423 307 418 291 C415 280 430 280 429 269 C428 255 419 240 438 238 Z" fill="#bd9190" stroke="#715047" stroke-width="3.5"/>
        <path d="M356 99 L357 151 C383 140 407 163 398 201 C390 236 358 262 322 249 C292 240 281 216 297 199 C310 185 330 197 340 177 C348 158 339 125 340 99" fill="#e3a18e" stroke="#715047" stroke-width="4"/>
        <path d="M384 182 C391 204 375 229 358 234" fill="none" stroke="#f2c6ac" stroke-width="6"/>
        <path d="M428 165 C410 158 401 177 405 199 C408 219 422 231 433 217 C445 202 447 174 428 165 Z" fill="#b399b0" stroke="#715047" stroke-width="3.5"/>
        <path d="M420 177 Q414 187 418 198" fill="none" stroke="#d4bbcb" stroke-width="5"/>
        <path d="M250 257 C263 245 277 248 289 251 C310 243 334 249 351 258 C360 271 332 278 309 272 C285 278 267 270 254 270 C242 272 240 263 250 257 Z" fill="#dfbb75" stroke="#715047" stroke-width="3"/>
        <path d="M203 343 C203 324 195 307 204 291 C212 279 230 287 245 283 Q270 279 289 287 Q320 279 342 287 C365 281 389 282 399 300 C408 314 398 331 402 348 C408 372 391 396 368 391 L330 389 Q318 394 320 419" fill="none" stroke="#715047" stroke-width="30"/>
        <path d="M203 343 C203 324 195 307 204 291 C212 279 230 287 245 283 Q270 279 289 287 Q320 279 342 287 C365 281 389 282 399 300 C408 314 398 331 402 348 C408 372 391 396 368 391 L330 389 Q318 394 320 419" fill="none" stroke="#d69e81" stroke-width="23"/>
        <path d="M220 284 L219 297 M250 280 L251 293 M283 283 L283 295 M318 283 L319 295 M355 284 L353 297 M397 313 L386 314 M402 347 L390 348 M380 393 L379 380 M348 390 L348 378" fill="none" stroke="#a57058" stroke-width="2.5"/>
        <path d="M233 320 C251 307 277 309 279 323 C281 340 230 330 232 347 C234 366 278 346 285 360 C294 379 333 374 348 362 C365 346 316 347 315 332 C314 315 346 308 368 321" fill="none" stroke="#715047" stroke-width="21"/>
        <path d="M233 320 C251 307 277 309 279 323 C281 340 230 330 232 347 C234 366 278 346 285 360 C294 379 333 374 348 362 C365 346 316 347 315 332 C314 315 346 308 368 321" fill="none" stroke="#e9b59b" stroke-width="15"/>
        <g opacity={selected==='surgery'&&active&&result?.variant==='transplant'?Math.max(.12,1-p*1.6):1}>
          <path d={liverPath} fill="#c8896c" stroke="#715047" stroke-width="4"/>
          <g clip-path="url(#liver-clip)">
            {#if value.region!=='unknown'}<rect x={value.region==='left'?285:120} y="108" width={value.region==='right'?165:320} height="160" fill="#e9ad7f" opacity=".57"/>{/if}
            <path d="M281 133 C275 151 282 177 265 196" fill="none" stroke="#915d48" stroke-width="3"/>
            <path d="M149 157 C152 135 181 124 207 128" fill="none" stroke="#f0bb94" stroke-width="8"/>
            <path d="M140 208 Q148 242 176 248" fill="none" stroke="#ac6e53" stroke-width="6" opacity=".45"/>
            {#if value.count==='diffuse' && placed}<path d={liverPath} fill="url(#diffuse-hatch)"/>{/if}
            {#if placed && value.count!=='diffuse'}
              <g opacity={selected==='surgery'&&active&&result?.variant==='resection'?1-Math.max(0,(p-.45)*2):1}>
                <circle cx={tx} cy={ty} r={radius} fill={value.size===''?'#e9dce5':'#ba97b1'} stroke="#614564" stroke-width="2.5" stroke-dasharray={value.size===''?'4 3':undefined}/>
                <circle cx={tx} cy={ty} r={radius-2} fill="url(#tumour-hatch)"/>
                {#if value.size===''}<text x={tx} y={ty+5} text-anchor="middle" fill="#513451" stroke="none" font-size="16">?</text>{/if}
                {#each Array(otherCount) as _,i}
                  <circle cx={otherMarkers[i].x} cy={otherMarkers[i].y} r="7" fill="#dbc6d5" stroke="#614564" stroke-width="1.8" stroke-dasharray="3 2"/>
                {/each}
              </g>
            {/if}
          </g>
        </g>
        <path d="M254 216 C274 229 263 253 248 249 C234 245 239 226 254 216 Z" fill="#aaba83" stroke="#715047" stroke-width="3"/>
        {#if active}
          {#if !placed}
            <circle cx={targetX} cy={targetY} r={radius} fill="#dbc6d5" stroke="#614564" stroke-width="2" stroke-dasharray="4 3"/>
          {/if}
          {#if selected==='ablation'}
            <circle cx={targetX} cy={targetY} r={radius+10} fill="#e8b760" opacity={Math.max(0,Math.min(.55,(p-.3)*1.1))} stroke="#996e37" stroke-width="1.5" stroke-dasharray="4 3"/>
            <g transform={`translate(${-(1-Math.min(1,p/.4))*58} ${-(1-Math.min(1,p/.4))*55})`} opacity={Math.min(1,p*8)}>
              <path d={`M${targetX-71} ${targetY-67} L${targetX} ${targetY}`} fill="none" stroke="#577976" stroke-width="5"/>
              <path d={`M${targetX-14} ${targetY-13} L${targetX} ${targetY}`} stroke="#f8ebcb" stroke-width="3"/>
              <path d={`M${targetX-83} ${targetY-78}L${targetX-67} ${targetY-63}`} stroke="#365d5b" stroke-width="12"/>
            </g>
          {:else if selected==='artery'}
            <path d={`M295 322L295 241Q296 217 277 208Q${targetX} 219 ${targetX} ${targetY+radius}`} fill="none" stroke="#a65e4b" stroke-width="9"/>
            <path d={`M295 322L295 241Q296 217 277 208Q${targetX} 219 ${targetX} ${targetY+radius}`} fill="none" stroke="#f1b49b" stroke-width="5"/>
            <path d={`M295 322L295 241Q296 217 277 208Q${targetX} 219 ${targetX} ${targetY+radius}`} fill="none" stroke="#426d70" stroke-width="2.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset={1-Math.min(1,p/.45)}/>
            {#each [0,1,2,3,4] as i}
              <circle cx={targetX+Math.sin(i*2)*7} cy={targetY+radius+5+Math.max(0,1-(p-.3)*2-i*.07)*30} r="3" fill="#dcb661" stroke="#8e6c32" stroke-width="1" opacity={p>.35?1:0}/>
            {/each}
          {:else if selected==='surgery'}
            {#if result?.variant==='transplant'}<path d={liverPath} fill="#d9a181" stroke="#755546" stroke-width="3" opacity={Math.max(0,(p-.45)*1.8)}/>
            {:else}
              <circle cx={targetX} cy={targetY} r={radius+13} fill="#f6e8d3" stroke="#755546" stroke-width="1.7" stroke-dasharray="5 4" opacity={Math.min(1,p*3)}/>
              <g transform={`translate(${-Math.max(0,p-.35)*70} ${-Math.max(0,p-.35)*80})`} opacity={1-Math.max(0,p-.75)*2.5}>
                <circle cx={targetX} cy={targetY} r={radius+12} fill="#c58b74" stroke="#755546" stroke-width="1.5" stroke-dasharray="5 4"/>
                <circle cx={targetX} cy={targetY} r={radius} fill="#ba97b1" stroke="#614564" stroke-width="2"/>
                <circle cx={targetX} cy={targetY} r={radius-2} fill="url(#tumour-hatch)"/>
              </g>
            {/if}
          {:else if selected==='medicines'}
            <path d="M295 90C276 185 283 267 292 363Q310 430 363 350C406 291 405 245 357 207Q308 188 295 90" fill="none" stroke="#86a19c" stroke-width="5" opacity=".6"/>
            {#each [0,1,2,3,4,5,6] as i}
              {@const t=(p*.75+i/7)%1}
              <circle cx={311+Math.sin(t*Math.PI*2)*64} cy={239+Math.cos(t*Math.PI*2)*120} r="5" fill="#e2bb70" stroke="#887249" stroke-width="1.5" opacity={Math.min(1,p*5)}/>
            {/each}
            <circle cx={targetX} cy={targetY} r={radius+9} fill="none" stroke="#658a82" stroke-width="3" stroke-dasharray="3 5" opacity={Math.max(0,(p-.4)*1.5)}/>
          {/if}
        {/if}
      </g>
      {#if !zoomed}
        <g class="organ-labels" fill="#6f6759" font-size="14">
          <text x="52" y="50">Person’s right</text><text x="443" y="50">Person’s left</text>
          <path d="M85 165L131 165 M365 226L471 248 M404 364L474 367" fill="none" stroke="#aa9a80" stroke-width="1.3"/>
          <text x="51" y="159" font-weight="600">Liver</text><text x="474" y="251">Stomach</text><text x="477" y="372">Bowel</text>
        </g>
      {/if}
    </svg>
    {#if !placed}<div class="location-note">{active?'Location unknown · generic site for this mechanism':'Location unknown · tumour not placed on the liver'}</div>{/if}
  </div>
  <div class="anatomy-legend"><span><i class="tumour-key"></i>{value.count==='diffuse'?'Diffuse disease':value.size===''?'Tumour · size unknown':`Largest tumour · ${value.size} cm`}</span><span>Schematic · not to scale</span></div>
  {#if otherCount>0}<details class="diagram-help"><summary>Marker details</summary><p>{value.count==='4+'?'Four markers stand for 4 or more tumours.':'Dashed dots show other tumours.'} Other sizes and exact positions are not entered.</p></details>{/if}
  {#if active}
    <div class="animation-bar">
      <p class="animation-caption">{caption}</p>
      <div class="playback"><span class="general-label">General mechanism</span>{#if !still}<button onclick={togglePause} disabled={finished}>{paused?'Resume':'Pause'}</button><button onclick={replay}>Replay</button>{/if}<label><input type="checkbox" checked={staticMode||reduced} disabled={reduced} onchange={e=>staticMode=e.currentTarget.checked}/>{reduced?'Reduced motion':'Still view'}</label></div>
      <details class="diagram-help"><summary>Diagram details</summary><p>{selected==='ablation'?'Probe route and heat zone are illustrative, not a safe patient-specific approach.':selected==='surgery'?'The removed portion is a teaching example, not an operation plan.':selected==='artery'?'A simplified tumour-feeding artery is shown, not a patient’s vessel map.':'Circulation is simplified. This does not predict a treatment response.'}{!placed?' A generic tumour site is used for this mechanism.':''}</p></details>
    </div>
  {/if}
</section>
