import { defineStore } from 'pinia';
import { api, tokenStorage } from '../api/http.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: tokenStorage.get(),
    user: null,
    role: null, // { key, label }
    permissions: [],
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.token && s.user),
    isAdmin: (s) => s.role?.key === 'admin',
  },

  actions: {
    /** True when the user holds every listed permission. */
    can(...permissions) {
      return permissions.flat().every((p) => this.permissions.includes(p));
    },

    /** True when the user has any one of the listed roles. */
    hasRole(...roles) {
      return roles.flat().includes(this.role?.key);
    },

    async login(email, password) {
      const { token } = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuthHandler: true,
      });
      this.token = token;
      tokenStorage.set(token);
      await this.fetchMe();
    },

    /** Loads the current user's role and permissions from the server. */
    async fetchMe() {
      const data = await api('/auth/me', { skipAuthHandler: true });
      this.user = data.user;
      this.role = data.role;
      this.permissions = data.permissions;
    },

    /** Restores a session from a stored token (called by the router guard). */
    async restore() {
      if (!this.token || this.user) return;
      try {
        await this.fetchMe();
      } catch {
        this.logout();
      }
    },

    logout() {
      tokenStorage.clear();
      this.$reset();
      this.token = null;
    },
  },
});
