<template>
	<view class="container">
		<view class="page-header">
			<text class="header-title">检测报告</text>
			<view class="header-right">
				<text class="report-date">{{timestamp}}</text>
				<view class="share-btn">
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="18" cy="5" r="3" stroke="#475569" stroke-width="1.8"/>
						<path d="M11 21H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v3" stroke="#475569" stroke-width="1.8"/>
					</svg>
				</view>
			</view>
		</view>

		<view class="content">
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

			<!-- 成功状态 - 结果卡片 -->
			<view class="result-card" v-if="success && result">
				<view class="card-accent"></view>
				<view class="risk-ring">
					<view class="ring-bg"></view>
					<svg viewBox="0 0 120 120" class="ring-svg">
						<circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" stroke-width="10"/>
						<circle cx="60" cy="60" r="50" fill="none" :stroke="riskColor" stroke-width="10" :stroke-dasharray="getDashArray()" stroke-linecap="round" transform="rotate(-90 60 60)"/>
					</svg>
					<view class="ring-center">
						<text class="risk-level">{{getRiskLevelText()}}</text>
					</view>
				</view>
				<text class="result-title">筛查结果：{{riskText}}</text>
				<text class="result-desc">{{result.summary || '分析完成'}}</text>
			</view>

			<!-- 分析图片 - 成功时显示 -->
			<view class="analysis-section" v-if="success && result">
				<text class="section-title">分析图片</text>
				<view class="annotation-image">
					<image :src="imagePath" mode="aspectFit" v-if="imagePath"/>
					<view v-else class="image-placeholder">
						<text>暂无图片</text>
					</view>
				</view>
				<text class="image-hint">AI 脊柱侧弯分析图</text>
			</view>

			<!-- 分析图片 - 错误时也显示 -->
			<view class="analysis-section" v-if="!success">
				<text class="section-title">上传图片</text>
				<view class="annotation-image">
					<image :src="imagePath" mode="aspectFit" v-if="imagePath"/>
					<view v-else class="image-placeholder">
						<text>暂无图片</text>
					</view>
				</view>
				<text class="image-hint">请上传符合要求的背部照片</text>
			</view>

			<!-- 核心基础判断 -->
			<view class="assessment-section" v-if="success && result && assessmentList.length > 0">
				<text class="section-title">核心基础判断</text>
				<view class="assessment-cards">
					<view class="assessment-card" :class="item.status" v-for="(item, index) in assessmentList" :key="index">
						<view class="assessment-header">
							<view class="assessment-icon" :class="item.status">
								<svg v-if="item.status === 'normal'" viewBox="0 0 24 24" fill="none">
									<path d="M5 13l4 4L19 7" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<svg v-else viewBox="0 0 24 24" fill="none">
									<path d="M12 9v4M12 17h.01" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
									<circle cx="12" cy="12" r="9" stroke="#DC2626" stroke-width="2"/>
								</svg>
							</view>
							<text class="assessment-title">{{item.title}}</text>
						</view>
						<text class="assessment-desc">{{item.description}}</text>
					</view>
				</view>
			</view>

			<view class="advice-section" v-if="success && result && result.recommendations">
				<text class="section-title">AI建议</text>
				<view class="advice-card">
					<view class="advice-item" v-for="(item, index) in result.recommendations" :key="index">
						<view class="advice-icon">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M9 12l2 2 4-4" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</view>
						<text class="advice-text">{{item}}</text>
					</view>
				</view>
			</view>

			<!-- 警告提示 - 错误时显示 -->
			<view class="warning-card" v-if="!success">
				<view class="warning-icon-wrapper">
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="#D97706" stroke-width="1.8"/>
						<path d="M12 8v4M12 16h.01" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</view>
				<text class="warning-text">请上传符合要求的背部照片后重新检测</text>
			</view>

			<!-- 警告提示 - 成功时显示 -->
			<view class="warning-card" v-if="success">
				<view class="warning-icon-wrapper">
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="#D97706" stroke-width="1.8"/>
						<path d="M12 8v4M12 16h.01" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</view>
				<text class="warning-text">如持续不适或发现体态明显异常，建议前往正规医院骨科或脊柱外科就诊，由专业医生进行详细检查。</text>
			</view>

			<text class="disclaimer">本结果仅为辅助筛查参考，不构成医疗诊断</text>
		</view>
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
			riskLevel: '',
			riskText: '',
			riskColor: '',
			timestamp: '',
			assessmentList: []
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
			this.processResult(result)
			saveRecord({
				type: 'photo',
				result: result,
				imagePath: imagePath,
				date: this.timestamp
			})
		}
	},
	methods: {
		processResult(result) {
			let riskText = ''
			let riskColor = ''

			if (result.riskLevel === 'low') {
				riskText = '低风险'
				riskColor = '#10B981'
			} else if (result.riskLevel === 'medium') {
				riskText = '中风险'
				riskColor = '#F59E0B'
			} else if (result.riskLevel === 'high') {
				riskText = '高风险'
				riskColor = '#EF4444'
			}

			this.riskText = riskText
			this.riskColor = riskColor
			this.riskLevel = result.riskLevel
			this.assessmentList = this.buildAssessmentList(result.detailedAssessment)
		},
		buildAssessmentList(detailedAssessment) {
			if (!detailedAssessment) return []

			const titleMap = {
				shoulders: '双肩高低',
				scapula: '肩胛对称',
				neckMidline: '颈部中线',
				waist: '腰窝对称',
				trunkMidline: '躯干中线',
				pelvis: '骨盆水平'
			}

			const list = []
			for (const key in detailedAssessment) {
				if (detailedAssessment.hasOwnProperty(key) && titleMap[key]) {
					list.push({
						key: key,
						title: titleMap[key],
						status: detailedAssessment[key].status || 'normal',
						description: detailedAssessment[key].description || ''
					})
				}
			}
			return list
		},
		getDashArray() {
			if (this.result.riskLevel === 'low') return '88 220'
			if (this.result.riskLevel === 'medium') return '110 220'
			return '154 220'
		},
		getRiskLevelText() {
			if (this.result.riskLevel === 'low') return '低'
			if (this.result.riskLevel === 'medium') return '中'
			return '高'
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
.container {
	min-height: 100vh;
	background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 40rpx;
	background: #FFFFFF;
	border-bottom: 2rpx solid #E2E8F0;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.header-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #0F172A;
	letter-spacing: 1rpx;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.report-date {
	font-size: 24rpx;
	color: #64748B;
}

.share-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #F8FAFC;
}

.share-btn svg {
	width: 36rpx;
	height: 36rpx;
}

.content {
	padding: 40rpx;
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

.result-card {
	background: #FFFFFF;
	border-radius: 40rpx;
	padding: 60rpx 40rpx;
	text-align: center;
	box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #F1F5F9;
	margin-bottom: 40rpx;
	position: relative;
	overflow: hidden;
}

.card-accent {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 8rpx;
	background: linear-gradient(90deg, #059669 0%, #D97706 50%, #DC2626 100%);
}

.risk-ring {
	position: relative;
	width: 280rpx;
	height: 280rpx;
	margin: 0 auto 40rpx;
}

.ring-bg {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 220rpx;
	height: 220rpx;
	border-radius: 50%;
	background: #D1FAE5;
	opacity: 0.5;
	filter: blur(32rpx);
}

.ring-svg {
	width: 100%;
	height: 100%;
}

.ring-center {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
}

.risk-level {
	font-size: 56rpx;
	font-weight: 800;
	color: #059669;
	line-height: 1.1;
}

.risk-label {
	font-size: 20rpx;
	color: #475569;
	margin-top: 4rpx;
}

.result-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 12rpx;
	display: block;
}

.result-desc {
	font-size: 26rpx;
	color: #64748B;
	line-height: 1.6;
}

.analysis-section {
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 24rpx;
	display: block;
	position: relative;
	padding-left: 20rpx;
}

.section-title::before {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 6rpx;
	height: 28rpx;
	background: linear-gradient(180deg, #F59E0B 0%, #D97706 100%);
	border-radius: 3rpx;
}

.annotation-image {
	background: #FFFFFF;
	border-radius: 32rpx;
	height: 380rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #F1F5F9;
	overflow: hidden;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
}

.annotation-image image {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.image-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
}

.image-placeholder text {
	font-size: 28rpx;
	color: #94A3B8;
}

.image-hint {
	font-size: 22rpx;
	color: #94A3B8;
	text-align: center;
	margin-top: 16rpx;
	display: block;
}

.assessment-section {
	margin-bottom: 40rpx;
}

.assessment-cards {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.assessment-card {
	background: #FFFFFF;
	border-radius: 28rpx;
	padding: 32rpx;
	border: 2rpx solid #F1F5F9;
	transition: all 0.2s ease;
}

.assessment-card.normal {
	border-left: 8rpx solid #059669;
}

.assessment-card.abnormal {
	border-left: 8rpx solid #DC2626;
}

.assessment-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.assessment-icon {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	flex-shrink: 0;
}

.assessment-icon.normal {
	background: #ECFDF5;
}

.assessment-icon.abnormal {
	background: #FEF2F2;
}

.assessment-icon svg {
	width: 24rpx;
	height: 24rpx;
}

.assessment-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #0F172A;
}

.assessment-desc {
	font-size: 24rpx;
	color: #64748B;
	line-height: 1.7;
	padding-left: 60rpx;
}

.advice-section {
	margin-bottom: 40rpx;
}

.advice-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 32rpx;
	border: 2rpx solid #F1F5F9;
}

.advice-item {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #F1F5F9;
}

.advice-item:last-child {
	border-bottom: none;
}

.advice-icon {
	width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ECFDF5;
	border-radius: 50%;
	flex-shrink: 0;
	margin-top: 4rpx;
}

.advice-icon svg {
	width: 20rpx;
	height: 20rpx;
}

.advice-text {
	font-size: 26rpx;
	color: #475569;
	line-height: 1.7;
}

.warning-card {
	background: linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 100%);
	border-radius: 32rpx;
	padding: 36rpx;
	display: flex;
	gap: 24rpx;
	align-items: flex-start;
	border: 2rpx solid #FDE68A;
	margin-bottom: 40rpx;
}

.warning-icon-wrapper {
	width: 52rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #FFFFFF;
	border-radius: 50%;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(217, 119, 6, 0.15);
}

.warning-icon-wrapper svg {
	width: 36rpx;
	height: 36rpx;
}

.warning-text {
	font-size: 26rpx;
	color: #92400E;
	line-height: 1.8;
	flex: 1;
}

.disclaimer {
	font-size: 22rpx;
	color: #94A3B8;
	text-align: center;
	line-height: 1.7;
	padding: 20rpx 0 40rpx;
}
</style>
