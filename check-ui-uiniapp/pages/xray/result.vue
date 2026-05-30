<template>
	<view class="page-container">
		<view class="nav-header">
			<view class="header-left">
				<text class="page-title">检测报告</text>
				<text class="page-subtitle">脊柱侧弯分析结果</text>
			</view>
			<view class="header-right">
				<text class="report-date">{{timestamp}}</text>
				<view class="action-btn share">
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="18" cy="5" r="3" stroke="#FFFFFF" stroke-width="1.8"/>
						<path d="M11 21H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v3" stroke="#FFFFFF" stroke-width="1.8"/>
					</svg>
				</view>
			</view>
		</view>

		<scroll-view class="content-scroll" scroll-y>
			<view class="main-content">
				<!-- 错误状态显示 -->
				<view class="error-section" v-if="!success">
					<view class="error-card">
						<view class="error-icon">
							<svg viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="#DC2626" stroke-width="2"/>
								<path d="M12 8v4M12 16h.01" stroke="#DC2626" stroke-width="2"/>
							</svg>
						</view>
						<view class="error-content">
							<text class="error-title">检测失败</text>
							<text class="error-message">{{errorMessage || '图片不符合要求，无法进行分析'}}</text>
						</view>
					</view>
				</view>

				<!-- 成功状态显示 -->
				<view class="hero-section" v-if="success && result">
					<view class="result-card">
						<view class="card-visual">
							<view class="image-wrapper">
								<image class="xray-photo" :src="imagePath" mode="aspectFit" />
								<view class="image-badge">
									<svg viewBox="0 0 24 24" fill="none">
										<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#FFFFFF"/>
									</svg>
								</view>
							</view>
						</view>
						<view class="card-info">
							<view class="result-badge" :class="getSeverityClass()">
								{{getSeverityText()}}
							</view>
							<view class="measurement">
								<text class="measurement-value">{{result.cobbAngle || 0}}</text>
								<text class="measurement-unit">°</text>
							</view>
							<text class="measurement-label">Cobb 角度</text>
							<view class="severity-progress">
								<view class="progress-track">
									<view class="progress-segment normal"></view>
									<view class="progress-segment mild"></view>
									<view class="progress-segment moderate"></view>
									<view class="progress-segment severe"></view>
									<view class="progress-segment extreme"></view>
								</view>
								<view class="progress-marker" :style="{left: getMarkerPosition()}">
									<view class="marker-dot"></view>
									<view class="marker-tail"></view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 双肺检测卡片 -->
				<view class="lung-section" v-if="success && result">
					<view class="lung-card">
						<view class="card-header">
							<view class="card-icon orange">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M12 22c-4.97 0-9-2.582-9-7v-1c0-2.757 2.243-5 5-5h8c2.757 0 5 2.243 5 5v1c0 4.418-4.03 7-9 7z" stroke="#FFFFFF" stroke-width="2"/>
									<path d="M5 8v2c0 2.485 2.015 4.5 4.5 4.5h5c2.485 0 4.5-2.015 4.5-4.5V8M8 8V6a4 4 0 018 0v2" stroke="#FFFFFF" stroke-width="2"/>
								</svg>
							</view>
							<text class="card-title">双肺检测</text>
							<view class="confidence-badge" v-if="result.lungConfidence" :class="getConfidenceClass()">
								<text class="confidence-text">{{getConfidenceText()}}</text>
							</view>
						</view>
						<view class="lung-status">
							<text class="status-label">脊柱侧弯对肺部影响</text>
							<text class="status-value" :class="getLungClass()">{{result.lungHealth || '未检测'}}</text>
						</view>
						<view class="lung-details" v-if="result.lungAffectedDetails">
							<text class="details-text">{{result.lungAffectedDetails}}</text>
						</view>
					</view>
				</view>

				<view class="info-section" v-if="success && result">
					<view class="info-card">
						<view class="card-header">
							<view class="card-icon blue">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#3B82F6" stroke-width="2"/>
								</svg>
							</view>
							<text class="card-title">分析详情</text>
						</view>
						<view class="info-grid">
							<view class="info-item">
								<text class="info-label">弯曲形态</text>
								<text class="info-value">{{result?.curveType || '-'}}</text>
							</view>
							<view class="info-item">
								<text class="info-label">弯曲位置</text>
								<text class="info-value">{{result?.curveLocation || '-'}}</text>
							</view>
							<view class="info-item">
								<text class="info-label">弯曲方向</text>
								<text class="info-value">{{result?.curveDirection || '-'}}</text>
							</view>
							<view class="info-item">
								<text class="info-label">椎体旋转</text>
								<text class="info-value" :class="{highlight: result?.vertebralRotation !== '无'}">{{result?.vertebralRotation || '-'}}</text>
							</view>
							<view class="info-item wide">
								<text class="info-label">受累椎体</text>
								<text class="info-value">{{result?.affectedVertebrae || '-'}}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="surgical-section" v-if="success && result && result.postSurgical">
					<view class="feature-card surgery">
						<view class="card-header">
							<view class="card-icon purple">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M12 6v12m0 0l-3-3m3 3l3-3" stroke="#FFFFFF" stroke-width="2"/>
								</svg>
							</view>
							<text class="card-title">手术信息</text>
						</view>
						<view class="detail-box" v-if="result.postSurgicalDetails">
							<text class="detail-content">{{result.postSurgicalDetails}}</text>
						</view>
					</view>
				</view>

				<view class="advice-section" v-if="success && result && result.recommendations">
					<view class="feature-card advice">
						<view class="card-header">
							<view class="card-icon green">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M9 12l2 2 4-4" stroke="#FFFFFF" stroke-width="2"/>
								</svg>
							</view>
							<text class="card-title">AI建议</text>
						</view>
						<view class="advice-list">
							<view class="advice-item" v-for="(item, index) in result.recommendations" :key="index">
								<view class="advice-number">{{index + 1}}</view>
								<text class="advice-content">{{item}}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="summary-section" v-if="success && result && result.summary">
					<view class="feature-card summary">
						<view class="card-header">
							<view class="card-icon teal">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFFFFF" stroke-width="2"/>
									<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FFFFFF" stroke-width="2"/>
								</svg>
							</view>
							<text class="card-title">报告总结</text>
						</view>
						<view class="summary-content">
							<text class="summary-text">{{result.summary}}</text>
						</view>
					</view>
				</view>

				<view class="warning-section" v-if="!success">
					<view class="warning-card">
						<view class="warning-icon">
							<svg viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="#D97706" stroke-width="2"/>
								<path d="M12 8v4M12 16h.01" stroke="#D97706" stroke-width="2"/>
							</svg>
						</view>
						<view class="warning-content">
							<text class="warning-desc">请上传符合要求的脊柱X光片后重新检测</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { saveRecord } from '@/utils/storage.js'

export default {
	data() {
		return {
			imagePath: '',
			result: null,
			success: false,
			errorMessage: '',
			timestamp: ''
		}
	},
	onLoad() {
		const imagePath = uni.getStorageSync('detectImage')
		const success = uni.getStorageSync('analysisSuccess')
		const result = uni.getStorageSync('analysisResult')
		const errorMessage = uni.getStorageSync('analysisError')

		this.imagePath = imagePath
		this.success = success
		this.result = result
		this.errorMessage = errorMessage
		this.timestamp = this.formatDate(new Date())

		if (success && result) {
			saveRecord({
				type: 'xray',
				result: result,
				imagePath: imagePath,
				date: this.timestamp
			})
		}
	},
	methods: {
		getSeverityText() {
			if (!this.result || !this.result.cobbAngle) return '轻度侧弯'
			const angle = this.result.cobbAngle
			if (angle < 10) return '正常范围'
			if (angle < 25) return '轻度侧弯'
			if (angle < 40) return '中度侧弯'
			if (angle < 60) return '重度侧弯'
			return '极重度侧弯'
		},
		getSeverityClass() {
			if (!this.result || !this.result.cobbAngle) return 'mild'
			const angle = this.result.cobbAngle
			if (angle < 10) return 'normal'
			if (angle < 25) return 'mild'
			if (angle < 40) return 'moderate'
			if (angle < 60) return 'severe'
			return 'extreme'
		},
		getLungClass() {
			if (!this.result || !this.result.lungHealth) return ''
			const health = this.result.lungHealth
			if (health.includes('正常')) return 'lung-normal'
			if (health.includes('轻度')) return 'lung-mild'
			if (health.includes('中度')) return 'lung-moderate'
			if (health.includes('重度')) return 'lung-severe'
			return ''
		},
		getConfidenceText() {
			if (!this.result || !this.result.lungConfidence) return ''
			const confidence = this.result.lungConfidence
			if (confidence === 'low') return '可信度低'
			if (confidence === 'medium') return '可信度中'
			if (confidence === 'high') return '可信度高'
			return ''
		},
		getConfidenceClass() {
			if (!this.result || !this.result.lungConfidence) return ''
			const confidence = this.result.lungConfidence
			if (confidence === 'low') return 'confidence-low'
			if (confidence === 'medium') return 'confidence-medium'
			if (confidence === 'high') return 'confidence-high'
			return ''
		},
		getMarkerPosition() {
			if (!this.result || !this.result.cobbAngle) return '50%'
			const angle = this.result.cobbAngle
			let position
			if (angle <= 10) {
				position = (angle / 10) * 20
			} else if (angle <= 25) {
				position = 20 + ((angle - 10) / 15) * 20
			} else if (angle <= 40) {
				position = 40 + ((angle - 25) / 15) * 20
			} else if (angle <= 60) {
				position = 60 + ((angle - 40) / 20) * 20
			} else {
				position = 80 + Math.min((angle - 60) / 60, 1) * 20
			}
			return `${Math.min(position, 98)}%`
		},
		getProgressWidth() {
			return this.getMarkerPosition()
		},
		formatDate(date) {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hour}:${minute}`
		}
	}
}
</script>

<style lang="scss" scoped>
.page-container {
	min-height: 100vh;
	background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
	display: flex;
	flex-direction: column;
}

.nav-header {
	background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
	padding: 32rpx;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	box-shadow: 0 8rpx 32rpx rgba(99, 102, 241, 0.3);
}

.header-left {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.page-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.page-subtitle {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
}

.header-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12rpx;
}

.report-date {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
}

.action-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	transition: all 0.3s ease;
}

.action-btn:active {
	transform: scale(0.9);
	background: rgba(255, 255, 255, 0.3);
}

.action-btn svg {
	width: 24rpx;
	height: 24rpx;
}

.content-scroll {
	flex: 1;
	height: calc(100vh - 140rpx);
}

.main-content {
	padding: 24rpx;
}

.error-section {
	margin-bottom: 24rpx;
}

.error-card {
	background: #FFFFFF;
	border-radius: 28rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #FEE2E2;
}

.error-icon {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #FEF2F2;
	border-radius: 50%;
	margin-bottom: 24rpx;
}

.error-icon svg {
	width: 48rpx;
	height: 48rpx;
}

.error-content {
	text-align: center;
}

.error-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #DC2626;
	display: block;
	margin-bottom: 12rpx;
}

.error-message {
	font-size: 26rpx;
	color: #64748B;
	line-height: 1.6;
}

.hero-section {
	margin-bottom: 24rpx;
}

.result-card {
	background: #FFFFFF;
	border-radius: 28rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	display: flex;
}

.card-visual {
	flex: 1.2;
	background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
	position: relative;
}

.image-wrapper {
	width: 100%;
	height: 300rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24rpx;
}

.xray-photo {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.image-badge {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 12rpx;
}

.image-badge svg {
	width: 20rpx;
	height: 20rpx;
}

.card-info {
	flex: 1;
	padding: 28rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 16rpx;
}

.result-badge {
	align-self: flex-start;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	font-weight: 600;
}

.result-badge.normal {
	background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
	color: #065F46;
}

.result-badge.mild {
	background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
	color: #B45309;
}

.result-badge.moderate {
	background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%);
	color: #9A3412;
}

.result-badge.severe {
	background: linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%);
	color: #991B1B;
}

.result-badge.extreme {
	background: linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%);
	color: #831843;
}

.measurement {
	display: flex;
	align-items: baseline;
	gap: 4rpx;
}

.measurement-value {
	font-size: 80rpx;
	font-weight: 800;
	color: #1E293B;
	line-height: 1;
}

.measurement-unit {
	font-size: 36rpx;
	font-weight: 600;
	color: #64748B;
}

.measurement-label {
	font-size: 24rpx;
	color: #64748B;
}

.severity-progress {
	position: relative;
	height: 16rpx;
	margin-top: 8rpx;
}

.progress-track {
	display: flex;
	height: 100%;
	background: #E2E8F0;
	border-radius: 8rpx;
	overflow: hidden;
}

.progress-segment {
	flex: 1;
}

.progress-segment.normal { background: #059669; }
.progress-segment.mild { background: #D97706; }
.progress-segment.moderate { background: #EA580C; }
.progress-segment.severe { background: #DC2626; }
.progress-segment.extreme { background: #DB2777; }

.progress-marker {
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);
	z-index: 10;
}

.marker-dot {
	width: 24rpx;
	height: 24rpx;
	background: #FFFFFF;
	border: 4rpx solid #F59E0B;
	border-radius: 50%;
	box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.4);
	animation: marker-pulse 2s ease-in-out infinite;
}

@keyframes marker-pulse {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.1); }
}

.marker-tail {
	width: 4rpx;
	height: 12rpx;
	background: #F59E0B;
	margin: 4rpx auto 0;
	border-radius: 2rpx;
}

.lung-section {
	margin-bottom: 20rpx;
}

.lung-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.lung-card .card-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.lung-card .card-icon {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 14rpx;
}

.lung-card .card-icon.orange {
	background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
}

.lung-card .card-icon svg {
	width: 22rpx;
	height: 22rpx;
}

.lung-card .card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1E293B;
}

.lung-status {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #F8FAFC;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.status-label {
	font-size: 26rpx;
	color: #64748B;
}

.status-value {
	font-size: 28rpx;
	font-weight: 600;
	color: #1E293B;
}

.status-value.lung-normal {
	color: #059669;
}

.status-value.lung-mild {
	color: #D97706;
}

.status-value.lung-moderate {
	color: #EA580C;
}

.status-value.lung-severe {
	color: #DC2626;
}

.lung-details {
	background: #FFF7ED;
	border-radius: 16rpx;
	padding: 20rpx;
	border-left: 6rpx solid #F97316;
}

.details-text {
	font-size: 26rpx;
	color: #92400E;
	line-height: 1.7;
}

.confidence-badge {
	margin-left: auto;
	padding: 6rpx 14rpx;
	border-radius: 20rpx;
	background: #F3F4F6;
}

.confidence-badge.confidence-low {
	background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
}

.confidence-badge.confidence-medium {
	background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.confidence-badge.confidence-high {
	background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
}

.confidence-text {
	font-size: 20rpx;
	font-weight: 500;
	color: #4B5563;
}

.confidence-badge.confidence-low .confidence-text {
	color: #DC2626;
}

.confidence-badge.confidence-medium .confidence-text {
	color: #B45309;
}

.confidence-badge.confidence-high .confidence-text {
	color: #065F46;
}

.info-section {
	margin-bottom: 20rpx;
}

.info-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.card-icon {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 14rpx;
}

.card-icon.blue {
	background: #EEF2FF;
}

.card-icon.purple {
	background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
}

.card-icon.green {
	background: #059669;
}

.card-icon.teal {
	background: #0EA5E9;
}

.card-icon svg {
	width: 22rpx;
	height: 22rpx;
}

.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1E293B;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
}

.info-item {
	background: #F8FAFC;
	border-radius: 16rpx;
	padding: 16rpx;
}

.info-item.wide {
	grid-column: 1 / -1;
}

.info-label {
	font-size: 22rpx;
	color: #64748B;
	display: block;
	margin-bottom: 8rpx;
}

.info-value {
	font-size: 28rpx;
	font-weight: 600;
	color: #1E293B;
}

.info-value.highlight {
	color: #D97706;
}

.surgical-section {
	margin-bottom: 20rpx;
}

.feature-card {
	border-radius: 24rpx;
	padding: 24rpx;
}

.feature-card.surgery {
	background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
	padding: 24rpx;
}

.feature-card.surgery .card-header {
	flex-wrap: wrap;
	gap: 12rpx;
}

.feature-card.surgery .card-title {
	color: #FFFFFF;
}

.feature-card.surgery .card-icon {
	background: rgba(255, 255, 255, 0.2);
}

.detail-box {
	margin-top: 16rpx;
	padding-top: 16rpx;
	border-top: 2rpx solid rgba(255, 255, 255, 0.2);
}

.detail-content {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.9);
	line-height: 1.6;
}

.advice-section {
	margin-bottom: 20rpx;
}

.feature-card.advice {
	background: #FFFFFF;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.advice-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-top: 16rpx;
}

.advice-item {
	display: flex;
	gap: 14rpx;
}

.advice-number {
	width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ECFDF5;
	border-radius: 50%;
	font-size: 20rpx;
	font-weight: 600;
	color: #059669;
	flex-shrink: 0;
}

.advice-content {
	font-size: 26rpx;
	color: #475569;
	line-height: 1.6;
	padding-top: 6rpx;
}

.summary-section {
	margin-bottom: 20rpx;
}

.feature-card.summary {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.summary-content {
	margin-top: 16rpx;
	width: 100%;
	box-sizing: border-box;
}

.summary-text {
	display: block;
	width: 100%;
	font-size: 28rpx;
	color: #475569;
	line-height: 1.8;
	background: #F8FAFC;
	padding: 24rpx;
	border-radius: 16rpx;
	border-left: 6rpx solid #0EA5E9;
	border-right: 6rpx solid transparent;
	word-break: break-all;
	box-sizing: border-box;
}

.warning-section {
	margin-bottom: 20rpx;
}

.warning-card {
	background: linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 100%);
	border-radius: 20rpx;
	padding: 24rpx;
	display: flex;
	gap: 20rpx;
	border: 2rpx solid #FDE68A;
}

.warning-icon {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #FFFFFF;
	border-radius: 50%;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(217, 119, 6, 0.2);
}

.warning-icon svg {
	width: 28rpx;
	height: 28rpx;
}

.warning-content {
	flex: 1;
}

.warning-desc {
	font-size: 26rpx;
	color: #92400E;
	line-height: 1.6;
}
</style>
