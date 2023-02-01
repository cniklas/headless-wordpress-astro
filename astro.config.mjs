import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind()],
	// site: 'https://tmt-plan.netlify.app/',
	// server: (command) => ({port: command === 'dev' ? 3000 : 4000}),
})
