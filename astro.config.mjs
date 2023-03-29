import { defineConfig } from 'astro/config'
import windi from 'astro-windi'

// https://astro.build/config
export default defineConfig({
	integrations: [windi()],
	// site: 'https://tmt-plan.netlify.app/',
	// server: (command) => ({port: command === 'dev' ? 3000 : 4000}),
})
