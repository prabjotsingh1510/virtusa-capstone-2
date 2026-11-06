<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { navigation } from '../config/navigation.js';
import { checkAccess } from '../router/access.js';
import AppIcon from '../components/AppIcon.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// HIG (sidebars.md): let people hide the sidebar, but never hide it by default.
const SIDEBAR_KEY = 'rbac_sidebar_hidden';
const sidebarHidden = ref(readPref());
function readPref() {
  try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
}
function toggleSidebar() {
  sidebarHidden.value = !sidebarHidden.value;
  try { localStorage.setItem(SIDEBAR_KEY, sidebarHidden.value ? '1' : '0'); } catch { /* ignore */ }
}

// Navigation visibility: keep only items whose route the user may enter,
// and drop sections that end up empty (e.g. "Administration" for users).
const visibleNav = computed(() =>
  navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => checkAccess(auth, router.resolve(item.to)).allowed),
    }))
    .filter((section) => section.items.length > 0),
);

// Same items, flattened, for the compact-width tab bar.
const tabItems = computed(() => visibleNav.value.flatMap((s) => s.items));

// If permissions change while a page is open (role revoked), re-run the
// access check for the current page instead of leaving it on screen.
watch(
  () => auth.permissions,
  () => {
    if (route.name !== 'forbidden' && !checkAccess(auth, route).allowed) {
      router.replace(route.fullPath); // the global guard will redirect
    }
  },
);

// The small toolbar title fades in once the large title scrolls away.
const scrolled = ref(false);
const onScroll = () => (scrolled.value = window.scrollY > 44);
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));

const initials = computed(() =>
  (auth.user?.name || '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2),
);

function logout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell" :class="{ 'sidebar-hidden': sidebarHidden, scrolled }">
    <!-- Functional layer: floating glass sidebar (regular variant) -->
    <aside class="sidebar glass" aria-label="Main navigation">
      <div class="sidebar-head">
        <span class="app-mark"><AppIcon name="shield" :size="18" /></span>
        <span class="app-name">Portal</span>
      </div>

      <nav class="sidebar-nav">
        <div v-for="section in visibleNav" :key="section.section" class="nav-group">
          <p class="nav-heading">{{ section.section }}</p>
          <RouterLink
            v-for="item in section.items"
            :key="item.label"
            :to="item.to"
            class="nav-item"
            active-class="selected"
          >
            <AppIcon :name="item.icon" :size="19" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="sidebar-account">
        <span class="monogram">{{ initials }}</span>
        <div class="account-text">
          <span class="account-name">{{ auth.user?.name }}</span>
          <span class="account-role">{{ auth.role?.label }}</span>
        </div>
      </div>
    </aside>

    <div class="main">
      <!-- Functional layer: glass toolbar, content scrolls beneath it -->
      <header class="toolbar glass">
        <button
          class="toolbar-btn sidebar-toggle"
          :aria-label="sidebarHidden ? 'Show Sidebar' : 'Hide Sidebar'"
          :aria-pressed="!sidebarHidden"
          @click="toggleSidebar"
        >
          <AppIcon name="sidebar" />
        </button>
        <span class="toolbar-title">{{ route.meta.title }}</span>
        <span class="toolbar-spacer" />
        <span class="role-tag" :class="auth.role?.key">{{ auth.role?.label }}</span>
        <button class="toolbar-btn" aria-label="Sign Out" title="Sign Out" @click="logout">
          <AppIcon name="logout" />
        </button>
      </header>

      <main class="content">
        <h1 class="large-title">{{ route.meta.title }}</h1>
        <RouterView />
      </main>
    </div>

    <!-- Compact widths: a tab bar replaces the sidebar (HIG Lens 2) -->
    <nav class="tab-bar glass" aria-label="Main navigation">
      <RouterLink
        v-for="item in tabItems"
        :key="item.label"
        :to="item.to"
        class="tab"
        active-class="selected"
      >
        <AppIcon :name="item.icon" :size="22" />
        <span>{{ item.short }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
