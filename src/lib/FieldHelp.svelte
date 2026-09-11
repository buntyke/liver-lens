<script lang="ts">
  let { label, text }: { label: string; text: string } = $props();
</script>

<details class="field-help">
  <summary aria-label={`Help with ${label}`}><span aria-hidden="true">?</span></summary>
  <p>{text}</p>
</details>
