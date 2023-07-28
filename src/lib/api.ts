import { parse } from 'node-html-parser'
const WP_URL: string = import.meta.env.WP_URL
const WP_HOME = `${WP_URL}/`
const REST_URL = `${WP_URL}/wp-json/wp/v2`

export const siteName: string = import.meta.env.WP_TITLE
export const wpAdmin = `${WP_URL}/admin`

const _fetchAPI = async (query = 'pages') => {
	const response = await fetch(`${REST_URL}/${query}`)
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
let pages: Page[] = []
const _getPages = async () => {
	if (pages.length) return pages

	const response = await _fetchAPI()
	pages = response.map(
		({ title: { rendered: title }, modified, content: { rendered: content }, slug, link, menu_order }): Page => ({
			title,
			content,
			modified,
			slug,
			isHome: link === WP_HOME,
			menu_order,
		})
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

export const processTable = (content: string) => {
	// https://github.com/taoqf/node-html-parser
	const dom = parse(content)
	const table = dom.querySelector('table')
	if (!table) return content

	const headers = []
	const thead = table.querySelector('thead')
	const tbody = table.querySelector('tbody')
	let cellList

	if (thead) {
		cellList = thead.querySelectorAll('th')
		for (const cell of cellList) {
			headers.push(cell.textContent.trim() || '')
		}

		table.insertAdjacentHTML('beforeend', `<tfoot>${thead.innerHTML}</tfoot>`)
	}
	const headersLength = headers.length

	if (tbody && headersLength) {
		cellList = tbody.querySelectorAll('td')
		// for (const cell of cellList) {
		// 	cell.dataset.th = headers[cell.cellIndex]
		// }
		cellList.forEach((cell, i) => {
			const j = i % headersLength
			cell.setAttribute('data-th', headers[j])
		})
	}

	return dom.innerHTML
}
