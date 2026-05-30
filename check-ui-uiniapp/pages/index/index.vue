<template>
	<view class="container">
		<view class="header-section">
			<view class="logo-wrapper">
				<view class="logo">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M12 4C12 4 8 10 8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14C16 10 12 4 12 4Z" stroke="white" stroke-width="2" fill="none"/>
						<circle cx="12" cy="14" r="1.5" fill="white"/>
						<path d="M12 3L12 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
						<path d="M12 18L12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</view>
			</view>
			<text class="app-title">脊安 AI 筛查</text>
			<text class="app-subtitle">AI驱动的脊柱侧弯智能筛查助手</text>
		</view>

		<view class="action-cards">
			<view class="action-card photo-card" @tap="goToPhotoUpload">
				<view class="card-bg-circle"></view>
				<view class="card-content">
					<view class="card-icon photo-icon">
						<svg viewBox="0 0 24 24" fill="none">
							<rect x="3" y="6" width="18" height="13" rx="2" stroke="#0D9488" stroke-width="1.8" fill="none"/>
							<circle cx="12" cy="12.5" r="3" stroke="#0D9488" stroke-width="1.8" fill="none"/>
							<circle cx="9" cy="9.5" r="0.8" fill="#0D9488"/>
						</svg>
					</view>
					<view class="card-info">
						<text class="card-title">后背照片检测</text>
						<text class="card-desc">拍摄或上传后背照片，快速筛查脊柱侧弯风险</text>
						<view class="primary-btn card-btn">开始检测</view>
					</view>
				</view>
			</view>

			<view class="action-card xray-card" @tap="goToXrayUpload">
				<view class="card-bg-circle-xray"></view>
				<view class="card-content">
					<view class="card-icon xray-icon">
						<svg viewBox="0 0 24 24" fill="none">
							<rect x="4" y="2" width="16" height="20" rx="3" stroke="#4F46E5" stroke-width="1.8" fill="none"/>
							<path d="M7 7h10M7 11h8M7 15h6" stroke="#4F46E5" stroke-width="1.8" stroke-linecap="round"/>
						</svg>
					</view>
					<view class="card-info">
						<text class="card-title">专业X光片分析</text>
						<text class="card-desc">上传脊柱X光片，精准测量Cobb角度，输出专业报告</text>
						<view class="primary-btn card-btn">开始分析</view>
					</view>
				</view>
			</view>
		</view>

		<view class="quick-links">
			<view class="quick-link-item" @tap="goToHistory">
				<view class="link-icon">
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="#475569" stroke-width="1.8"/>
						<path d="M12 7v5l3 3" stroke="#475569" stroke-width="1.8" stroke-linecap="round"/>
					</svg>
				</view>
				<text class="link-text">检测历史</text>
				<view class="link-badge">{{ recordCount }}</view>
				<view class="link-arrow">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M9 6l6 6-6 6" stroke="#C0C8D0" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</view>
			</view>
			<view class="quick-link-item" @tap="goToKnowledge">
				<view class="link-icon">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#475569" stroke-width="1.8"/>
					</svg>
				</view>
				<text class="link-text">科普知识</text>
				<view class="link-arrow">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M9 6l6 6-6 6" stroke="#C0C8D0" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</view>
			</view>
		</view>

		<view class="footer">
			<text class="footer-text">本工具仅为辅助筛查，不构成医疗诊断</text>
		</view>
	</view>
</template>

<script>
import { getRecords } from '@/utils/storage.js'

export default {
	data() {
		return {
			recordCount: 0
		}
	},
	onShow() {
		this.refreshRecordCount()
	},
	methods: {
		refreshRecordCount() {
			const records = getRecords()
			this.recordCount = records.length
		},
		goToPhotoUpload() {
			uni.navigateTo({
				url: '/pages/photo/upload'
			})
		},
		goToXrayUpload() {
			uni.navigateTo({
				url: '/pages/xray/upload'
			})
		},
		goToHistory() {
			uni.navigateTo({
				url: '/pages/history/list'
			})
		},
		goToKnowledge() {
			uni.navigateTo({
				url: '/pages/knowledge/index'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	padding: 60rpx 40rpx 48rpx;
	display: flex;
	flex-direction: column;
	background: #F5F7FA;
	box-sizing: border-box;
}

.header-section {
	text-align: center;
	margin-bottom: 64rpx;
	padding-top: 20rpx;
}

.logo-wrapper {
	margin-bottom: 40rpx;
}

.logo {
	width: 136rpx;
	height: 136rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #2DD4BF 100%);
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 20rpx 56rpx rgba(13, 148, 136, 0.28);
}

.logo svg {
	width: 68rpx;
	height: 68rpx;
}

.app-title {
	font-size: 52rpx;
	font-weight: 700;
	color: #0F172A;
	letter-spacing: 4rpx;
	line-height: 1.4;
	display: block;
}

.app-subtitle {
	font-size: 28rpx;
	color: #64748B;
	margin-top: 20rpx;
	line-height: 1.7;
	display: block;
}

.action-cards {
	display: flex;
	flex-direction: column;
	gap: 36rpx;
	margin-bottom: 52rpx;
}

.action-card {
	background: #FFFFFF;
	border-radius: 40rpx;
	padding: 48rpx 40rpx;
	box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.06);
	border: 2rpx solid #F1F5F9;
	position: relative;
	overflow: hidden;
}

.card-bg-circle {
	position: absolute;
	top: -80rpx;
	right: -80rpx;
	width: 280rpx;
	height: 280rpx;
	border-radius: 50%;
	background: #F0FDFA;
	opacity: 0.55;
}

.card-bg-circle-xray {
	position: absolute;
	bottom: -60rpx;
	left: -60rpx;
	width: 240rpx;
	height: 240rpx;
	border-radius: 50%;
	background: #E0E7FF;
	opacity: 0.45;
}

.card-content {
	position: relative;
	display: flex;
	align-items: flex-start;
	gap: 36rpx;
}

.card-icon {
	width: 120rpx;
	height: 120rpx;
	border-radius: 34rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.photo-icon {
	background: linear-gradient(135deg, #CCFBF1, #99F6E4);
	box-shadow: 0 12rpx 32rpx rgba(13, 148, 136, 0.18);
}

.xray-icon {
	background: linear-gradient(135deg, #E0E7FF, #C7D2FE);
	box-shadow: 0 12rpx 32rpx rgba(99, 102, 241, 0.14);
}

.card-icon svg {
	width: 58rpx;
	height: 58rpx;
}

.card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.card-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 14rpx;
	line-height: 1.3;
}

.card-desc {
	font-size: 26rpx;
	color: #64748B;
	line-height: 1.7;
	margin-bottom: 28rpx;
	flex: 1;
}

.card-btn {
	align-self: flex-start;
	padding: 24rpx 48rpx;
	font-size: 28rpx;
	font-weight: 600;
}

.quick-links {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 8rpx 0;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
	margin-bottom: 40rpx;
}

.quick-link-item {
	display: flex;
	align-items: center;
	padding: 32rpx 40rpx;
	border-bottom: 2rpx solid #F1F5F9;
}

.quick-link-item:last-child {
	border-bottom: none;
}

.link-icon {
	margin-right: 28rpx;
	display: flex;
	align-items: center;
	opacity: 0.75;
}

.link-icon svg {
	width: 36rpx;
	height: 36rpx;
}

.link-text {
	flex: 1;
	font-size: 30rpx;
	color: #0F172A;
	font-weight: 500;
}

.link-badge {
	background: #F0FDFA;
	color: #0D9488;
	font-size: 24rpx;
	font-weight: 700;
	padding: 6rpx 20rpx;
	border-radius: 999rpx;
	min-width: 52rpx;
	text-align: center;
	margin-right: 12rpx;
}

.link-arrow {
	opacity: 0.35;
}

.link-arrow svg {
	width: 32rpx;
	height: 32rpx;
}

.footer {
	margin-top: auto;
	text-align: center;
	padding-top: 36rpx;
}

.footer-text {
	font-size: 22rpx;
	color: #94A3B8;
	line-height: 1.6;
}
</style>
