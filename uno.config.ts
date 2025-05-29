import { defineConfig, presetMini } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
	// https://unocss.dev/presets/mini
	presets: [presetMini({ dark: 'media' })],
	// https://unocss.dev/transformers/directives
	transformers: [transformerDirectives()],
})
