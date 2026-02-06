import { parse } from 'node-html-parser'
import { WP_URL } from 'astro:env/server'
const HOME_URL = `${WP_URL}/`
const REST_URL = `${WP_URL}/wp-json/wp/v2`
const LOGIN_URL = `${WP_URL}/admin`

type WordPressPage = {
	title: { rendered: string }
	modified: string
	content: { rendered: string }
	slug: string
	link: string
	menu_order: number
}

const _fetchFromWordPress = async (query = 'pages'): Promise<WordPressPage[]> => {
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
				isHome: link === HOME_URL,
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
const _calendarPages: CalendarPage[] = [{ title: 'Ton', slug: 'ton', isHome: false }]

export const getCalendarPage = (key: string) => _calendarPages.find(item => item.slug === key)

export const buildNavi: () => Promise<Page[] | CalendarPage[]> = async () => {
	const _pages = await _getPages()

	return [..._pages, ..._calendarPages]
}

export const staticLinks = [{ title: 'Login', url: LOGIN_URL }]

export const processTable = (content: string) => {
	// https://github.com/taoqf/node-html-parser
	const dom = parse(content)
	const table = dom.querySelector('table')
	if (!table) return content

	const headers: string[] = []
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
