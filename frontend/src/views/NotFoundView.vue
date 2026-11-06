<script setup>
import AppIcon from '../components/AppIcon.vue';
</script>

<template>
  <div class="auth-page">
    <section class="status-page" style="max-width: 480px">
      <span class="status-symbol"><AppIcon name="search" :size="30" /></span>
      <h2>Page Not Found</h2>
      <p>There’s nothing at <code>{{ $route.fullPath }}</code>. Check the address, or go back to the portal.</p>
      <div class="actions">
        <RouterLink to="/" class="btn btn-prominent">Back to Portal</RouterLink>
      </div>
    </section>
  </div>
</template>
