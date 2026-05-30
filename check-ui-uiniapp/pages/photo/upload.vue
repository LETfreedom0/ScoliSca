<template>
	<view class="container">
		<view class="page-header">
			<view class="back-btn" @tap="goBack">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M15 6l-6 6 6 6" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</view>
			<text class="page-title">后背照片检测</text>
		</view>

		<view class="upload-area" @tap="chooseImage">
			<view class="upload-icon">
				<svg viewBox="0 0 24 24" fill="none">
					<rect x="3" y="6" width="18" height="13" rx="2" stroke="#0D9488" stroke-width="1.8" fill="none"/>
					<circle cx="12" cy="12.5" r="3" stroke="#0D9488" stroke-width="1.8" fill="none"/>
				</svg>
			</view>
			<text class="upload-title">点击拍摄或上传后背照片</text>
			<text class="upload-desc">建议在自然光下，穿贴身衣物拍摄</text>
		</view>

		<view class="example-section">
			<text class="section-label">拍摄示例</text>
			<view class="example-grid">
				<view class="example-item">
					<view class="example-image">
						<text class="image-label">正面站立</text>
					</view>
					<text class="example-text">正面站立</text>
				</view>
				<view class="example-item">
					<view class="example-image">
						<text class="image-label">背面自然光</text>
					</view>
					<text class="example-text">背面自然光</text>
				</view>
				<view class="example-item">
					<view class="example-image">
						<text class="image-label">光线充足</text>
					</view>
					<text class="example-text">光线充足</text>
				</view>
			</view>
		</view>

		<view class="action-buttons">
			<view class="secondary-btn btn-full" @tap="chooseFromAlbum">从相册选择</view>
			<view class="primary-btn btn-full" @tap="takePhoto">立即拍摄</view>
		</view>

		<view class="tips-card">
			<text class="tip-item">✓ 光线充足，避免逆光</text>
			<text class="tip-item">✓ 背景简洁，无杂物</text>
			<text class="tip-item">✓ 穿贴身衣物，展露背部</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		chooseImage() {
			uni.showActionSheet({
				itemList: ['从相册选择', '拍照'],
				success: (res) => {
					if (res.tapIndex === 0) {
						this.chooseFromAlbum()
					} else {
						this.takePhoto()
					}
				}
			})
		},
		chooseFromAlbum() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album'],
				success: (res) => {
					this.goToLoading(res.tempFilePaths[0], 'photo')
				}
			})
		},
		takePhoto() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['camera'],
				success: (res) => {
					this.goToLoading(res.tempFilePaths[0], 'photo')
				}
			})
		},
		goToLoading(imagePath, mode) {
			uni.setStorageSync('detectImage', imagePath)
			uni.setStorageSync('detectMode', mode)
			uni.navigateTo({
				url: '/pages/loading/index'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	padding: 0 40rpx 48rpx;
	background: #F5F7FA;
}

.page-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 36rpx 0;
}

.back-btn {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-btn svg {
	width: 40rpx;
	height: 40rpx;
}

.page-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #0F172A;
}

.upload-area {
	border: 4rpx dashed #E2E8F0;
	border-radius: 36rpx;
	padding: 80rpx 60rpx;
	text-align: center;
	margin-bottom: 48rpx;
	background: #FFFFFF;
}

.upload-icon {
	width: 128rpx;
	height: 128rpx;
	border-radius: 32rpx;
	background: #F0FDFA;
	margin: 0 auto 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.upload-icon svg {
	width: 64rpx;
	height: 64rpx;
}

.upload-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 12rpx;
	display: block;
}

.upload-desc {
	font-size: 26rpx;
	color: #64748B;
	display: block;
}

.example-section {
	margin-bottom: 40rpx;
}

.section-label {
	font-size: 28rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 24rpx;
}

.example-grid {
	display: flex;
	gap: 24rpx;
}

.example-item {
	flex: 1;
	text-align: center;
}

.example-image {
	width: 100%;
	height: 180rpx;
	background: #F8FAFC;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
	border: 2rpx dashed #E2E8F0;
}

.image-label {
	font-size: 22rpx;
	color: #94A3B8;
}

.example-text {
	font-size: 22rpx;
	color: #94A3B8;
}

.action-buttons {
	display: flex;
	gap: 28rpx;
	margin-bottom: 40rpx;
}

.btn-full {
	flex: 1;
	padding: 26rpx 0;
}

.tips-card {
	background: #F0FDFA;
	border-radius: 28rpx;
	padding: 32rpx;
}

.tip-item {
	font-size: 26rpx;
	color: #115E59;
	line-height: 2.4;
}
</style>
