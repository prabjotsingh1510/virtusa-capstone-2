<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const profile = ref(null);

const initials = computed(() =>
  (profile.value?.name || '').split(' ').map((p) => p[0]).join('').slice(0, 2),
);

onMounted(async () => {
  profile.value = (await api('/profile')).user;
});
</script>

<template>
  <template v-if="profile">
    <section class="profile-head">
      <span class="monogram">{{ initials }}</span>
      <h2 class="profile-name">{{ profile.name }}</h2>
      <p class="profile-email">{{ profile.email }}</p>
    </section>

    <section class="group">
      <p class="group-header">Account</p>
      <ul class="list">
        <li class="row"><span class="row-main row-title">Name</span><span class="row-value">{{ profile.name }}</span></li>
        <li class="row"><span class="row-main row-title">Email</span><span class="row-value">{{ profile.email }}</span></li>
        <li class="row">
          <span class="row-main row-title">Role</span>
          <span class="role-tag" :class="auth.role.key">{{ auth.role.label }}</span>
        </li>
        <li class="row">
          <span class="row-main row-title">Member Since</span>
          <span class="row-value">{{ new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) }}</span>
        </li>
      </ul>
      <p class="group-footer">Only an administrator can change your role.</p>
    </section>
  </template>
</template>
