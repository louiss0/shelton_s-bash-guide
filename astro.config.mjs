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
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Overview', link: '/' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Variables', link: '/concepts/variables/' },
						{ label: 'Functions', link: '/concepts/functions/' },
						{ label: 'Conditionals', link: '/concepts/conditionals/' },
						{ label: 'Loops', link: '/concepts/loops/' },
						{ label: 'File Operations', link: '/concepts/file-operations/' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Index', link: '/reference/' },
						{
							label: 'Builtins',
							items: [
								{ label: 'declare', link: '/reference/builtins/declare/' },
								{ label: 'echo', link: '/reference/builtins/echo/' },
								{ label: 'read', link: '/reference/builtins/read/' },
							],
						},
						{
							label: 'Syntax',
							items: [
								{ label: 'Quoting', link: '/reference/syntax/quoting/' },
								{ label: 'Redirection', link: '/reference/syntax/redirection/' },
							],
						},
						{
							label: 'Keywords',
							items: [
								{ label: 'if', link: '/reference/keywords/if/' },
							],
						},
					],
				},
				{
					label: 'Explanations',
					items: [
						{ label: 'Streams & Processes', link: '/explanations/streams-and-processes/' },
						{ label: 'Quoting & Expansion', link: '/explanations/quoting-and-expansion/' },
					],
				},
			],
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
