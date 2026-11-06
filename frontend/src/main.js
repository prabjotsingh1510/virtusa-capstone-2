import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import { onUnauthorized, onForbidden } from './api/http.js';
import { useAuthStore } from './stores/auth.js';
import './style.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

const auth = useAuthStore();

// Server says the session is gone (expired / user deleted) -> back to login.
onUnauthorized(() => {
  auth.logout();
  const current = router.currentRoute.value;
  if (current.name !== 'login') {
    router.replace({ name: 'login', query: { redirect: current.fullPath, reason: 'expired' } });
  }
});

// Server refused an action -> our cached permissions may be stale (e.g. an
// admin changed this user's role). Resync so the nav and guards update.
onForbidden(() => {
  auth.fetchMe().catch(() => {});
});

app.mount('#app');
