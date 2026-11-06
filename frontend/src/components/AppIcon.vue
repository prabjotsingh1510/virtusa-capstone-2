<script setup>
// One consistent, stroke-based icon set (SF Symbols-like weight) so every
// icon matches the weight of adjacent text. Decorative by default; pass
// `label` when an icon stands alone so screen readers can announce it.
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  label: { type: String, default: '' },
});

const ICONS = {
  house: '<path d="M3.5 10.5 12 3.5l8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
  checklist:
    '<path d="m3.5 6.5 1.6 1.6L8 5.2M3.5 12.5l1.6 1.6L8 11.2M3.5 18.5l1.6 1.6L8 17.2M11.5 7h9M11.5 13h9M11.5 19h9"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c0-4.1 3.6-7 8-7s8 2.9 8 7"/>',
  people:
    '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20c0-3.7 2.9-6.4 6.5-6.4s6.5 2.7 6.5 6.4M15.5 4.6a3.6 3.6 0 0 1 0 6.8M17.6 14c2.3.8 3.9 3 3.9 6"/>',
  chart: '<path d="M3.5 20.5h17M6.5 17v-5M11.5 17V6M16.5 17V9.5"/>',
  sliders:
    '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.5"/><circle cx="8" cy="17" r="2.5"/>',
  sidebar: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9.5 4.5v15"/>',
  logout: '<path d="M14.5 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
  shield: '<path d="M12 3.2 19 6v5.2c0 4.4-2.9 8.2-7 9.6-4.1-1.4-7-5.2-7-9.6V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chevron: '<path d="m9.5 6 6 6-6 6"/>',
  bolt: '<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>',
};

const svg = computed(() => ICONS[props.name] || '');
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    v-html="svg"
  />
</template>
