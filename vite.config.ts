import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

if (!process.env.PUBLIC_BUILD_TIME) {
  process.env.PUBLIC_BUILD_TIME = new Date().toISOString();
}

export default defineConfig({
  plugins: [sveltekit()]
});
