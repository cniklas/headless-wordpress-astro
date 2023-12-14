import { parse } from 'node-html-parser'
const WP_URL: string = import.meta.env.WP_URL
const WP_HOME_URL = `${WP_URL}/`
const WP_REST_URL = `${WP_URL}/wp-json/wp/v2`
const WP_ADMIN_URL = `${WP_URL}/admin`

export const siteName: string = import.meta.env.WP_TITLE

const _fetchFromWordPress = async (query = 'pages') => {
	const response = await fetch(`${WP_REST_URL}/${query}`)
	if (response.ok) return response.json()

	const error = await response.json()
	throw new Error(`❗ Failed to fetch API for ${query}\nCode: ${error.code}\nMessage: ${error.message}\n`)
}

export type Page = {
	title: string
	content: string
	modified: string
	slug: string
	isHome: boolean
	menu_order: number
}
const pages: Page[] = []
const _getPages = async () => {
	if (pages.length) return pages

	const response = await _fetchFromWordPress()
	response.forEach(
		({ title: { rendered: title }, modified, content: { rendered: content }, slug, link, menu_order }) => {
			pages.push({
				title,
				content,
				modified,
				slug,
				isHome: link === WP_HOME_URL,
				menu_order,
			})
		},
	)
	pages.sort((a, b) => (a.isHome ? -1 : b.isHome ? 1 : a.menu_order - b.menu_order))

	return pages
}

export const getHomePage = async () => {
	const _pages = await _getPages()

	return _pages.find(item => item.isHome)
}

export const getAllExceptHomePage = async () => {
	const _pages = await _getPages()

	return _pages.filter(item => !item.isHome)
}

export type CalendarPage = {
	title: string
	slug: string
	isHome: boolean
}
const _calendarPages: CalendarPage[] = [
	{ title: 'Ton', slug: 'ton', isHome: false },
	{ title: 'Support', slug: 'support', isHome: false },
]

export const getCalendarPage = (key: string) => _calendarPages.find(item => item.slug === key)

export const buildNavi: () => Promise<Page[] | CalendarPage[]> = async () => {
	const _pages = await _getPages()

	return [..._pages, ..._calendarPages]
}

export const staticLinks = [{ title: 'Login', url: WP_ADMIN_URL }]

export const processTable = (content: string) => {
	// https://github.com/taoqf/node-html-parser
	const dom = parse(content)
	const table = dom.querySelector('table')
	if (!table) return content

	const headers = []
	const thead = table.querySelector('thead')

	if (thead) {
		const cellList = thead.querySelectorAll('th')
		cellList.forEach(cell => {
			const content = cell.textContent.trim()
			headers.push(content)
			// a11y: table headers should not comtain empty `<th>` elements
			if (!content.length) cell.replaceWith('<td></td>')
			else cell.setAttribute('scope', 'col')
		})

		thead.insertAdjacentHTML('afterend', `<tfoot aria-hidden="true">${thead.innerHTML}</tfoot>`)
	}

	const tbody = table.querySelector('tbody')
	const headersLength = headers.length

	if (tbody && headersLength) {
		const cellList = tbody.querySelectorAll('td')
		// for (const cell of cellList) {
		// 	cell.dataset.th = headers[cell.cellIndex]
		// }
		cellList.forEach((cell, i) => {
			const j = i % headersLength
			if (j === 0 && !headers[j].length) {
				cell.replaceWith(`<th scope="row">${cell.textContent}</th>`)
				return
			}
			cell.setAttribute('data-th', headers[j])
		})
	}

	return dom.innerHTML
}
