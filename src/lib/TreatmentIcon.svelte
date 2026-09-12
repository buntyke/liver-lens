<script lang="ts">import type { TreatmentId } from './rules';let {id}:{id:TreatmentId}=$props();</script>
<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
{#if id==='surgery'}<path d="M5 13C5 5 14 7 19 10C24 12 29 7 28 13C25 21 19 18 15 24C7 29 4 23 5 13Z"/><path d="M17 9L14 26" stroke-dasharray="2 3"/>
{:else if id==='ablation'}<circle cx="19" cy="19" r="9" stroke-dasharray="2 3"/><circle cx="19" cy="19" r="4"/><path d="M3 3L19 19M2 6L6 2"/>
{:else if id==='artery'}<path d="M15 29V18C15 11 5 14 5 4M15 19C15 9 25 14 26 4M8 12L4 18M22 12L29 17"/><circle cx="15" cy="23" r="1"/><circle cx="17" cy="15" r="1"/>
{:else}<path d="M10 5L24 19A6 6 0 0 1 16 27L3 14A6 6 0 0 1 10 5Z"/><path d="M9 20L17 12M24 4V10M21 7H27"/>{/if}
</svg>
