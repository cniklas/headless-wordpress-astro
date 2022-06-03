const WP_URL = import.meta.env.WP_URL
const WP_HOME = `${WP_URL}/`
const REST_URL = `${WP_URL}/wp-json/wp/v2`

export const siteName = 'TOS Media Team'

const fetchAPI = async (query = 'pages') => {
	const response = await fetch(`${REST_URL}/${query}`)

	if (response.ok) {
		return response.json()
	}

	const error = await response.json()
	throw new Error(`❗ Failed to fetch API for ${query}\nCode: ${error.code}\nMessage: ${error.message}\n`)
}

export const getHomePage = async () => {
	const response = await fetchAPI()
	const page = response.find(item => item.link === WP_HOME)

	return page
}

export const getAllExceptHomePage = async () => {
	const response = await fetchAPI()
	const pages = response.filter(item => item.link !== WP_HOME)

	return pages
}
