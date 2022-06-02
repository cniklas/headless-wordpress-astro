export const formatDate = (date = null) => {
	const format = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }

	return new Date(date).toLocaleDateString('de-DE', format)
}
