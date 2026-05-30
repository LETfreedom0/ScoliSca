<template>
	<view class="container">
		<view class="page-header">
			<view class="back-btn" @tap="goBack">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M15 6l-6 6 6 6" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</view>
			<text class="page-title">专业X光片分析</text>
		</view>

		<view class="upload-area" @tap="chooseImage">
			<view class="upload-icon xray-icon">
				<svg viewBox="0 0 24 24" fill="none">
					<rect x="4" y="2" width="16" height="20" rx="3" stroke="#4F46E5" stroke-width="1.8" fill="none"/>
					<path d="M7 7h10M7 11h8M7 15h6" stroke="#4F46E5" stroke-width="1.8" stroke-linecap="round"/>
				</svg>
			</view>
			<text class="upload-title">点击拍摄或上传X光片</text>
			<text class="upload-desc">请上传包含完整脊柱的X光正位片</text>
		</view>

		<view class="example-section">
			<text class="section-label">拍摄示例</text>
			<view class="xray-example-image">
				<text class="image-label">脊柱X光正位片</text>
			</view>
		</view>

		<view class="action-button">
			<view class="primary-btn btn-full" @tap="chooseFromAlbum">从相册选择</view>
		</view>

		<view class="tips-card">
			<text class="tip-item">✓ 光片需清晰显示完整脊柱</text>
			<text class="tip-item">✓ 正位片（正面拍摄）</text>
			<text class="tip-item">✓ 建议由专业机构拍摄</text>
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
					this.goToLoading(res.tempFilePaths[0], 'xray')
				}
			})
		},
		takePhoto() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['camera'],
				success: (res) => {
					this.goToLoading(res.tempFilePaths[0], 'xray')
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
	margin: 0 auto 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.xray-icon {
	background: #E0E7FF;
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

.xray-example-image {
	width: 100%;
	height: 260rpx;
	background: #F8FAFC;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx dashed #E2E8F0;
}

.image-label {
	font-size: 24rpx;
	color: #94A3B8;
}

.action-button {
	margin-bottom: 40rpx;
}

.btn-full {
	width: 100%;
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
