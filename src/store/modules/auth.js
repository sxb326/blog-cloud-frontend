import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loginFormStatus: false,
    authUser: null,
  }),
  actions: {
    toggleLoginForm() {
      this.loginFormStatus = !this.loginFormStatus;
    },
    setAuthUser(authUser) {
      this.authUser = authUser;
    },
    clearAuthUser() {
      this.authUser = null;
    },
  },
});
