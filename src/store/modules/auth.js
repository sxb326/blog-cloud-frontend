import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loginFormStatus: false,
  }),
  actions: {
    toggleLoginForm() {
      this.loginFormStatus = !this.loginFormStatus;
    },
  },
});
