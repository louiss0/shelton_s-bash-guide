// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://github.io', // Will be updated when repository URL is known
	integrations: [
		starlight({
			title: "Shelton's Bash Guide",
			customCss: ['./src/styles/nord.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			// Sidebar will be populated after content is created
			sidebar: [],
		}),
	],
	markdown: {
		shikiConfig: {
			langs: ['bash', 'sh', 'shell', 'zsh'],
			themes: {
				light: 'nord',
				dark: 'nord',
			},
		},
	},
});
