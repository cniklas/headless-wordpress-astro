const DOMAIN = import.meta.env.PUBLIC_DOMAIN
const REST_URL = `${DOMAIN}/wp-json/wp/v2`
const HOME_PAGE = `${DOMAIN}/`

export const siteName = 'TOS Media Team'

export const fetchAPI = async (query = 'pages') => {
	const response = await fetch(`${REST_URL}/${query}`)

	if (response.ok) {
		return response.json()
	}

	const error = await response.json()
	throw new Error(`❗ Failed to fetch API for ${query}\nCode: ${error.code}\nMessage: ${error.message}\n`)
}

export const getHomePage = async () => {
	const pages = await fetchAPI('pages')
	const page = pages.find(page => page.link === HOME_PAGE)

	return page
}
