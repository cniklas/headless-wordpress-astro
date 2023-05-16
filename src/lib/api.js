import { parse, insertAdjacentHTML } from 'node-html-parser'
const WP_URL = import.meta.env.WP_URL
const WP_HOME = `${WP_URL}/`
const REST_URL = `${WP_URL}/wp-json/wp/v2`

export const siteName = import.meta.env.WP_TITLE
export const wpAdmin = `${WP_URL}/admin`

const _fetchAPI = async (query = 'pages') => {
	const response = await fetch(`${REST_URL}/${query}`)

	if (response.ok) {
		return response.json()
	}

	const error = await response.json()
	throw new Error(`❗ Failed to fetch API for ${query}\nCode: ${error.code}\nMessage: ${error.message}\n`)
}

const _getPages = async () => {
	const response = await _fetchAPI()
	const pages = response.map(({ id, modified, slug, link, title, content }) => ({
		id,
		isHome: link === WP_HOME,
		modified,
		slug,
		link,
		title,
		content,
	}))

	return pages
}

export const getHomePage = async () => {
	const response = await _getPages()
	const page = response.find(item => item.isHome)

	return page
}

export const getAllExceptHomePage = async () => {
	const response = await _getPages()
	const pages = response.filter(item => !item.isHome)

	return pages
}

export const buildNavi = async () => {
	const response = await _getPages()
	// make sure, 'Home' always comes first
	const navi = [response.find(item => item.isHome), ...response.filter(item => !item.isHome)]

	return navi
}

export const processTable = content => {
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
