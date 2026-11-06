<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api/http.js';
import AppIcon from '../components/AppIcon.vue';

const tasks = ref([]);
const loaded = ref(false);
const remaining = computed(() => tasks.value.filter((t) => !t.done).length);

onMounted(async () => {
  tasks.value = (await api('/tasks')).tasks;
  loaded.value = true;
});

async function toggle(task) {
  const { task: updated } = await api(`/tasks/${task.id}`, { method: 'PATCH', body: { done: !task.done } });
  Object.assign(task, updated);
}
</script>

<template>
  <section v-if="loaded" class="group">
    <p class="group-header">{{ remaining }} Remaining</p>
    <ul v-if="tasks.length" class="list">
      <li v-for="t in tasks" :key="t.id" class="row">
        <button
          class="check-circle"
          :class="{ on: t.done }"
          role="checkbox"
          :aria-checked="t.done"
          :aria-label="t.title"
          @click="toggle(t)"
        >
          <AppIcon v-if="t.done" name="check" :size="14" />
        </button>
        <span class="row-main row-title" :class="{ 'done-text': t.done }">{{ t.title }}</span>
      </li>
    </ul>
    <div v-else class="list"><p class="row muted">You have no tasks right now.</p></div>
  </section>
  <p v-else class="muted" role="status">Loading…</p>
</template>
