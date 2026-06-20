import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  appType: 'spa',
  build: {
    target: 'es2020'
  }
});
