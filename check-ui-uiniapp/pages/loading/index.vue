<template>
	<view class="container">
		<view class="loading-content">
			<view class="scan-container">
				<view class="scan-bg"></view>
				<view class="scan-box">
					<svg viewBox="0 0 40 180" class="spine-svg">
						<path d="M20 5C28 30,25 50,18 70C14 85,22 95,19 110C16 130,24 145,20 175" stroke="#94A3B8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.5"/>
						<rect x="14" y="11" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="31" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="51" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="71" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="91" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="111" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="131" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
						<rect x="14" y="151" width="12" height="8" rx="3" fill="#E2E8F0" opacity="0.6"/>
					</svg>
					<view class="scan-line"></view>
				</view>
				<view class="pulse-ring"></view>
			</view>

			<text class="loading-title">AI 分析中</text>
			<text class="loading-message">{{currentMessage}}</text>

			<view class="loading-dots">
				<view class="dot dot-1"></view>
				<view class="dot dot-2"></view>
				<view class="dot dot-3"></view>
			</view>

			<text class="loading-time">{{isPhoto ? '预计 5 秒内完成' : '预计 10 秒内完成'}}</text>
		</view>
	</view>
</template>

<script>
import apiConfig from '@/api/config.js'

export default {
	data() {
		return {
			isPhoto: true,
			currentMessage: '正在上传图片...',
			messages: [
				'正在上传图片...',
				'AI 正在分析体态特征...',
				'正在检测脊柱轮廓...',
				'正在计算风险指数...',
				'生成分析报告中...'
			],
			messageIndex: 0
		}
	},
	onLoad() {
		const mode = uni.getStorageSync('detectMode')
		this.isPhoto = mode === 'photo'
		this.startAnalysis()
	},
	onUnload() {
		if (this.timer) {
			clearInterval(this.timer)
		}
	},
	methods: {
		startAnalysis() {
			this.messageIndex = 0
			this.currentMessage = this.messages[0]
			
			this.timer = setInterval(() => {
				this.messageIndex++
				if (this.messageIndex < this.messages.length) {
					this.currentMessage = this.messages[this.messageIndex]
				}
			}, 2000)

			this.performAnalysis()
		},
		async performAnalysis() {
			const imagePath = uni.getStorageSync('detectImage')
			const mode = uni.getStorageSync('detectMode')
			
			try {
				this.currentMessage = '正在上传图片...'
				const uploadResult = await this.uploadImageFile(imagePath)
				
				if (!uploadResult || !uploadResult.url) {
					throw new Error('图片上传失败')
				}

				this.currentMessage = 'AI 正在分析...'
				const analysisResult = await this.callAnalysisAPI(uploadResult.url, mode)

				if (this.timer) {
					clearInterval(this.timer)
				}

				uni.setStorageSync('analysisSuccess', analysisResult.success)
				uni.setStorageSync('analysisResult', analysisResult.data || null)
				uni.setStorageSync('analysisError', analysisResult.error || null)

				const resultPage = mode === 'photo' ? '/pages/photo/result' : '/pages/xray/result'
				uni.redirectTo({
					url: resultPage
				})
			} catch (error) {
				if (this.timer) {
					clearInterval(this.timer)
				}
				
				uni.setStorageSync('analysisSuccess', false)
				uni.setStorageSync('analysisError', error.message || '分析失败，请重试')
				
				const resultPage = mode === 'photo' ? '/pages/photo/result' : '/pages/xray/result'
				uni.redirectTo({
					url: resultPage
				})
			}
		},
		uploadImageFile(filePath) {
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: apiConfig.uploadImage,
					filePath: filePath,
					name: 'file',
					success: (res) => {
						try {
							const data = JSON.parse(res.data)
							if (data.success && data.data?.url) {
								resolve({ url: data.data.url })
							} else {
								reject(new Error(data.error || '上传失败'))
							}
						} catch {
							reject(new Error('上传响应解析失败'))
						}
					},
					fail: (err) => {
						reject(new Error('上传失败'))
					}
				})
			})
		},
		callAnalysisAPI(imageUrl, mode) {
			return new Promise((resolve, reject) => {
				uni.request({
					url: apiConfig.analyze,
					method: 'POST',
					data: {
						image: imageUrl,
						imageType: mode
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data) {
							// 返回完整响应，包括 success、data、error 等
							resolve(res.data)
						} else {
							reject(new Error('分析失败'))
						}
					},
					fail: (err) => {
						reject(new Error('网络请求失败'))
					}
				})
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F5F7FA;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 48rpx;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.scan-container {
	position: relative;
	margin-bottom: 100rpx;
}

.scan-bg {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 440rpx;
	height: 440rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%);
}

.scan-box {
	width: 320rpx;
	height: 460rpx;
	position: relative;
	background: #FFFFFF;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.06);
	border: 2rpx solid #F1F5F9;
}

.spine-svg {
	width: 88rpx;
	height: 400rpx;
}

.scan-line {
	position: absolute;
	left: 60rpx;
	right: 60rpx;
	height: 6rpx;
	background: linear-gradient(90deg, transparent, #0D9488 20%, #0D9488 80%, transparent);
	animation: scanLine 2s ease-in-out infinite;
	box-shadow: 0 0 36rpx rgba(13, 148, 136, 0.5), 0 0 72rpx rgba(13, 148, 136, 0.2);
	border-radius: 4rpx;
}

.pulse-ring {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	border: 4rpx solid #0D9488;
	opacity: 0.12;
	animation: pulse 2.2s ease-in-out infinite;
}

.loading-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 20rpx;
}

.loading-message {
	font-size: 28rpx;
	color: #0D9488;
	font-weight: 500;
	min-height: 40rpx;
	margin-bottom: 64rpx;
}

.loading-dots {
	display: flex;
	gap: 24rpx;
	margin-bottom: 48rpx;
}

.dot {
	width: 18rpx;
	height: 18rpx;
	border-radius: 50%;
	background: #0D9488;
}

.dot-1 {
	animation: dotBounce 1.2s ease-in-out infinite;
	opacity: 0.3;
}

.dot-2 {
	animation: dotBounce 1.2s ease-in-out 0.18s infinite;
	opacity: 0.5;
}

.dot-3 {
	animation: dotBounce 1.2s ease-in-out 0.36s infinite;
	opacity: 0.7;
}

.loading-time {
	font-size: 24rpx;
	color: #94A3B8;
	margin-bottom: 96rpx;
}

@keyframes scanLine {
	0% { top: 10%; opacity: 0.3; }
	50% { top: 80%; opacity: 1; }
	100% { top: 10%; opacity: 0.3; }
}

@keyframes pulse {
	0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
	50% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
}

@keyframes dotBounce {
	0%, 80%, 100% { transform: translateY(0); }
	40% { transform: translateY(-14rpx); }
}
</style>
