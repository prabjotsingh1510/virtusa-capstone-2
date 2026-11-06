<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import AppIcon from '../components/AppIcon.vue';

const route = useRoute();
const auth = useAuthStore();

const from = computed(() => route.query.from || 'This page');
const missing = computed(() => (route.query.missing ? String(route.query.missing).split(',') : []));
const roles = computed(() => (route.query.roles ? String(route.query.roles).split(',') : []));
</script>

<template>
  <section class="status-page">
    <span class="status-symbol lock"><AppIcon name="lock" :size="30" /></span>
    <h2>You Don’t Have Access</h2>
    <p>
      You’re signed in as {{ auth.user?.name }} ({{ auth.role?.label }}).
      <code>{{ from }}</code> needs more access than your role gives you.
    </p>

    <ul v-if="roles.length || missing.length" class="list">
      <li v-if="roles.length" class="row">
        <span class="row-main row-title">Required Role</span>
        <code class="pill">{{ roles.join(' or ') }}</code>
      </li>
      <li v-for="m in missing" :key="m" class="row">
        <span class="row-main row-title">Missing Permission</span>
        <code class="pill">{{ m }}</code>
      </li>
    </ul>

    <p class="small">If you need this page, ask an administrator to change your role. Error 403.</p>
    <div class="actions">
      <RouterLink :to="{ name: 'dashboard' }" class="btn btn-prominent">Go to Dashboard</RouterLink>
      <button class="btn btn-gray" @click="$router.back()">Go Back</button>
    </div>
  </section>
</template>
