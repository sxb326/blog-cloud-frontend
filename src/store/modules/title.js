import { defineStore } from 'pinia';

export const useTitleStore = defineStore('title', {
  state: () => ({
    title: '分布式博客',
  }),
  actions: {
    setTitle(newTitle) {
      this.title = newTitle;
      document.title = newTitle;
    },
  },
});
