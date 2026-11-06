<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';
import AppIcon from '../components/AppIcon.vue';

const auth = useAuthStore();
const data = ref(null);
const error = ref('');

// "Prove it" panel: call protected endpoints directly, bypassing the UI,
// to show that the backend enforces permissions on its own.
const probes = [
  { label: 'My tasks', path: '/tasks' },
  { label: 'User list (admin)', path: '/admin/users' },
  { label: 'System settings (admin)', path: '/admin/settings' },
];
const probeResults = ref({});

async function probe(p) {
  probeResults.value[p.path] = { pending: true };
  try {
    await api(p.path, { skipAuthHandler: true });
    probeResults.value[p.path] = { ok: true, text: 'Allowed · 200' };
  } catch (e) {
    probeResults.value[p.path] = { ok: false, text: `Denied · ${e.status}`, detail: e.message };
  }
}

onMounted(async () => {
  try {
    data.value = await api('/dashboard');
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <p v-if="error" class="banner error" role="alert">{{ error }}</p>

  <template v-else-if="data">
    <section class="welcome">
      <p>{{ data.greeting }} Your menu shows only the pages your role can open.</p>
    </section>

    <section class="group" aria-label="Summary">
      <p class="group-header">Summary</p>
      <div class="metrics">
        <div v-for="s in data.stats" :key="s.label" class="metric">
          <span class="metric-value">{{ s.value }}</span>
          <span class="metric-label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <section class="group">
      <p class="group-header">Your Permissions</p>
      <div class="list">
        <div class="pill-list">
          <code v-for="p in auth.permissions" :key="p" class="pill">{{ p }}</code>
        </div>
      </div>
      <p class="group-footer">Granted by the {{ auth.role.label }} role on the server.</p>
    </section>

    <section class="group">
      <p class="group-header">Server Access Check</p>
      <ul class="list">
        <li v-for="p in probes" :key="p.path" class="row has-icon">
          <span class="row-icon" style="background: var(--label-3)"><AppIcon name="bolt" :size="16" /></span>
          <span class="row-main">
            <span class="row-title">{{ p.label }}</span>
            <span class="row-sub"><code>GET /api{{ p.path }}</code></span>
          </span>
          <span
            v-if="probeResults[p.path] && !probeResults[p.path].pending"
            class="status"
            :class="probeResults[p.path].ok ? 'ok' : 'bad'"
            :title="probeResults[p.path].detail"
          >{{ probeResults[p.path].text }}</span>
          <button class="btn btn-gray" :disabled="probeResults[p.path]?.pending" @click="probe(p)">
            Test
          </button>
        </li>
      </ul>
      <p class="group-footer">
        Hiding a link is only a convenience. Each test calls the API directly, and the server’s
        authorization middleware decides.
      </p>
    </section>
  </template>

  <p v-else class="muted" role="status">Loading…</p>
</template>
