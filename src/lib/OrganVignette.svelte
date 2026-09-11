<script lang="ts">
  import { liverPath } from './artwork';
</script>

<!-- The same organs as the explorer, used as a small visual introduction. -->
<svg class="organ-vignette" viewBox="115 92 330 188" aria-hidden="true">
  <g stroke="#715047" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M356 106 L357 158 C383 143 407 166 398 204 C390 238 358 262 322 249 C299 241 294 215 310 201 C325 187 339 194 342 173 L341 106" fill="#e3a18e"/>
    <path d={liverPath} fill="#c8896c"/>
    <path d="M281 133 C275 151 282 177 265 196" fill="none" stroke="#915d48" stroke-width="3"/>
    <path d="M149 157 C152 135 181 124 207 128" fill="none" stroke="#f0bb94" stroke-width="8"/>
    <path d="M254 216 C274 229 263 253 248 249 C234 245 239 226 254 216 Z" fill="#aaba83"/>
  </g>
</svg>
