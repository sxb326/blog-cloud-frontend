import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    showLoginForm: false,
    authUser: null,
  }),
  actions: {
    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },
    setAuthUser(authUser) {
      this.authUser = authUser;
    },
    clearAuthUser() {
      this.authUser = null;
    },
  },
});
