import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'docs', assets: 'docs' }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/liver-lens' : '',
      relative: false
    }
  }
};
