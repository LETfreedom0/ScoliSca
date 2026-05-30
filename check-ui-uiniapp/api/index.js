import config from './config.js'

// 通用请求封装
function request(url, options = {}) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: config.BASE_URL + url,
			method: options.method || 'GET',
			data: options.data,
			header: {
				'Content-Type': 'application/json',
				...options.header
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					reject(res)
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

// 上传图片
export function uploadImage(filePath) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: config.uploadImage,
			filePath: filePath,
			name: 'file',
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(JSON.parse(res.data))
				} else {
					reject(res)
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

// 分析图片
export function analyzeImage(data) {
	return request('/analyze', {
		method: 'POST',
		data: data
	})
}

// 获取配置
export function getConfig() {
	return request('/config')
}
