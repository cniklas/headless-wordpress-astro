export const formatDate = (date: string | number) => {
	const format: Intl.DateTimeFormatOptions = {
		// year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	}

	return `${new Date(date).toLocaleDateString('de', format)} Uhr`
}
