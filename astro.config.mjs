// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://shelton_s-bash-guide.onrender.com',
	integrations: [
		starlight({
			title: "Shelton's Bash Guide",
			description: 'A developer-focused Bash guide with beautiful Nord theming, comprehensive reference, and practical examples.',
			customCss: ['./src/styles/nord.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/louiss0/shelton-s-bash-guide' }],
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
						{ label: 'Data Types', link: '/concepts/data-types/' },
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
								{ label: 'export', link: '/reference/builtins/export/' },
								{ label: 'local', link: '/reference/builtins/local/' },
								{ label: 'read', link: '/reference/builtins/read/' },
								{ label: 'test / [', link: '/reference/builtins/test/' },
								{ label: 'unset', link: '/reference/builtins/unset/' },
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
								{ label: '[[', link: '/reference/keywords/double-bracket/' },
								{ label: 'if', link: '/reference/keywords/if/' },
							],
						},
					],
				},
				{
					label: 'How-To Guides',
					items: [
						{ label: 'Run Script in Subproject', link: '/how-to/run-in-subproject/' },
						{ label: 'Bash Scripting Best Practices', link: '/how-to/scripting-best-practices/' },
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
			themes: {
				light: 'nord',
				dark: 'nord',
			},
		},
},
});
