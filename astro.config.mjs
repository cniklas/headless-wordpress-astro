import { defineConfig, envField } from 'astro/config'
import UnoCSS from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
	integrations: [UnoCSS({ injectReset: true })],
	devToolbar: {
		enabled: false,
	},
	env: {
		schema: {
			WP_URL: envField.string({ context: 'server', access: 'secret' }),
			WP_TITLE: envField.string({ context: 'server', access: 'public' }),
		},
	},
})
