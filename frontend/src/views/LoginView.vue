<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import AppIcon from '../components/AppIcon.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const notice = computed(() => {
  if (route.query.reason === 'expired') return 'Your session expired. Sign in again to continue.';
  if (route.query.redirect) return 'Sign in to open that page.';
  return '';
});

const demoAccounts = [
  { label: 'Administrator', email: 'admin@demo.test', password: 'admin123', icon: 'shield' },
  { label: 'Regular User', email: 'user@demo.test', password: 'user123', icon: 'person' },
];

function fill(acc) {
  email.value = acc.email;
  password.value = acc.password;
}

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null;
    // Only follow internal paths to avoid open redirects.
    router.replace(redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : { name: 'dashboard' });
  } catch (e) {
    // writing.md: say what went wrong and how to fix it
    error.value = e.status === 401 ? 'That email and password don’t match. Check them and try again.' : e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="submit">
      <div class="auth-head">
        <span class="app-mark"><AppIcon name="shield" :size="30" /></span>
        <h1 class="auth-title">Sign In to Portal</h1>
        <p class="auth-sub">Use your work account.</p>
      </div>

      <p v-if="notice && !error" class="banner info" role="status">{{ notice }}</p>
      <p v-if="error" class="banner error" role="alert">{{ error }}</p>

      <div class="auth-fields">
        <label>
          <span class="field-label">Email</span>
          <input v-model="email" class="input" type="email" autocomplete="username" placeholder="name@company.com" required />
        </label>
        <label>
          <span class="field-label">Password</span>
          <input v-model="password" class="input" type="password" autocomplete="current-password" placeholder="Required" required />
        </label>
      </div>

      <button class="btn btn-prominent btn-large block" :disabled="loading || !email || !password">
        {{ loading ? 'Signing In…' : 'Sign In' }}
      </button>

      <div class="group">
        <p class="group-header">Demo Accounts</p>
        <div class="list demo-list">
          <button
            v-for="acc in demoAccounts"
            :key="acc.email"
            type="button"
            class="row has-icon"
            @click="fill(acc)"
          >
            <span class="row-icon"><AppIcon :name="acc.icon" :size="17" /></span>
            <span class="row-main">
              <span class="row-title">{{ acc.label }}</span>
              <span class="row-sub">{{ acc.email }} · {{ acc.password }}</span>
            </span>
            <AppIcon name="chevron" :size="16" class="row-chevron" />
          </button>
        </div>
        <p class="group-footer">Choose an account to fill in its details.</p>
      </div>
    </form>
  </div>
</template>
