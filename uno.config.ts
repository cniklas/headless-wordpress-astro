import { defineConfig, presetMini, transformerDirectives } from 'unocss'

export default defineConfig({
	// https://unocss.dev/presets/mini
	presets: [presetMini({ dark: 'media' })],
	// https://unocss.dev/transformers/directives
	transformers: [transformerDirectives()],
})
