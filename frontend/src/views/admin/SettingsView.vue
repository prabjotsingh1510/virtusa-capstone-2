<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../../api/http.js';

const form = ref(null);
const original = ref(null);
const saved = ref(false);
const saving = ref(false);

const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(original.value));

onMounted(async () => {
  const { settings } = await api('/admin/settings');
  form.value = { ...settings };
  original.value = { ...settings };
});

async function save() {
  saved.value = false;
  saving.value = true;
  try {
    const { settings } = await api('/admin/settings', { method: 'PUT', body: form.value });
    form.value = { ...settings };
    original.value = { ...settings };
    saved.value = true;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form v-if="form" style="display: contents" @submit.prevent="save">
    <p v-if="saved && !dirty" class="banner success" role="status">Changes saved.</p>

    <section class="group">
      <p class="group-header">General</p>
      <div class="list">
        <label class="row">
          <span class="row-title">Site Name</span>
          <input v-model="form.siteName" class="row-input" placeholder="Required" />
        </label>
      </div>
    </section>

    <section class="group">
      <p class="group-header">Access</p>
      <ul class="list">
        <li class="row">
          <label class="row-main row-title" for="signup">Allow Self Sign-Up</label>
          <span class="switch">
            <input id="signup" v-model="form.allowSelfSignup" type="checkbox" role="switch" />
            <span class="switch-track" />
          </span>
        </li>
        <li class="row">
          <label class="row-main row-title" for="maint">Maintenance Mode</label>
          <span class="switch">
            <input id="maint" v-model="form.maintenanceMode" type="checkbox" role="switch" />
            <span class="switch-track" />
          </span>
        </li>
      </ul>
      <p class="group-footer">Only roles with the settings:manage permission can see or change these.</p>
    </section>

    <div>
      <button class="btn btn-prominent" :disabled="!dirty || saving">
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>
  </form>
</template>
