module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
	darkMode: 'media',
	theme: {
		extend: {
			colors: {
				tmtGray: {
					100: '#f7fafc',
					300: '#e2e8f0',
					400: '#cbd5e0',
					500: '#a0aec0',
					600: '#718096',
					650: '#5d6a80',
					700: '#4a5568',
					800: '#2d3748',
					900: '#1a202c',
				},
			},
		},
	},
	plugins: [],
}
