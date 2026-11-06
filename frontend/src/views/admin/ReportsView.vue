<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../../api/http.js';

const report = ref(null);
onMounted(async () => (report.value = await api('/admin/reports')));

const completion = computed(() => {
  if (!report.value) return 0;
  const { total, done } = report.value.taskCompletion;
  return total ? Math.round((done / total) * 100) : 0;
});
</script>

<template>
  <template v-if="report">
    <section class="group">
      <p class="group-header">People by Role</p>
      <div class="metrics">
        <div v-for="r in report.usersByRole" :key="r.role" class="metric">
          <span class="metric-value">{{ r.count }}</span>
          <span class="metric-label">{{ r.role }}{{ r.count === 1 ? '' : 's' }}</span>
        </div>
        <div class="metric">
          <span class="metric-value">{{ report.usersByRole.reduce((n, r) => n + r.count, 0) }}</span>
          <span class="metric-label">Total</span>
        </div>
      </div>
    </section>

    <section class="group">
      <p class="group-header">Task Completion</p>
      <div class="list">
        <div class="row" style="flex-direction: column; align-items: stretch; gap: 0; padding: 16px">
          <div style="display: flex; justify-content: space-between; align-items: baseline">
            <span class="metric-value">{{ completion }}%</span>
            <span class="muted">{{ report.taskCompletion.done }} of {{ report.taskCompletion.total }} done</span>
          </div>
          <div
            class="meter"
            role="progressbar"
            :aria-valuenow="completion"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Task completion"
          >
            <div class="meter-fill" :style="{ width: completion + '%' }" />
          </div>
        </div>
      </div>
      <p class="group-footer">Updated {{ new Date(report.generatedAt).toLocaleString() }}</p>
    </section>
  </template>
  <p v-else class="muted" role="status">Loading…</p>
</template>
