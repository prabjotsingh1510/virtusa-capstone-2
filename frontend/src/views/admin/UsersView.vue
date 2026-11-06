<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../api/http.js';
import { useAuthStore } from '../../stores/auth.js';
import { P } from '../../config/permissions.js';

const auth = useAuthStore();
const users = ref([]);
const roles = ref([]);
const message = ref(null);

async function load() {
  const data = await api('/admin/users');
  users.value = data.users;
  roles.value = data.roles;
}

function roleLabel(key) {
  return roles.value.find((r) => r.key === key)?.label || key;
}

async function changeRole(user, role) {
  message.value = null;
  try {
    const { user: updated } = await api(`/admin/users/${user.id}/role`, { method: 'PATCH', body: { role } });
    Object.assign(user, updated);
    message.value = { type: 'success', text: `${user.name} is now ${roleLabel(role)}.` };
  } catch (e) {
    message.value = { type: 'error', text: e.message };
    await load(); // revert the pop-up to the server's value
  }
}

const initials = (name) => name.split(' ').map((p) => p[0]).join('').slice(0, 2);

onMounted(load);
</script>

<template>
  <p v-if="message" class="banner" :class="message.type" role="status">{{ message.text }}</p>

  <section class="group">
    <p class="group-header">{{ users.length }} People</p>
    <ul class="list">
      <li v-for="u in users" :key="u.id" class="row has-icon">
        <span class="monogram" style="width: 32px; height: 32px; font-size: 12px">{{ initials(u.name) }}</span>
        <span class="row-main">
          <span class="row-title">
            {{ u.name }}<span v-if="u.id === auth.user.id" class="muted"> (You)</span>
          </span>
          <span class="row-sub">{{ u.email }}</span>
        </span>
        <!-- Element-level rule: only users:manage may edit roles -->
        <select
          v-if="auth.can(P.USERS_MANAGE)"
          class="popup"
          :value="u.role"
          :aria-label="`Role for ${u.name}`"
          @change="changeRole(u, $event.target.value)"
        >
          <option v-for="r in roles" :key="r.key" :value="r.key">{{ r.label }}</option>
        </select>
        <span v-else class="role-tag" :class="u.role">{{ roleLabel(u.role) }}</span>
      </li>
    </ul>
    <p class="group-footer">
      Role changes apply on that person’s next request — the server re-reads roles every time.
    </p>
  </section>
</template>
