// API 配置
const BASE_URL = 'http://localhost:3001/api'

export default {
	BASE_URL,
	uploadImage: `${BASE_URL}/files/upload`,
	analyze: `${BASE_URL}/analyze`,
	getConfig: `${BASE_URL}/config`
}
