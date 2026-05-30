<template>
	<view class="container">
		<view class="page-header">
			<view class="back-btn" @tap="goBack">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M15 6l-6 6 6 6" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</view>
			<text class="header-title">历史记录</text>
			<view class="type-badge">
				<text>{{recordType === 'photo' ? '后背照片' : 'X光片'}}</text>
			</view>
		</view>

		<view class="content">
			<!-- X光片结果 -->
			<template v-if="recordType === 'xray'">
				<!-- 主卡片：图片+结果 -->
				<view class="result-card">
					<view class="card-visual">
						<view class="image-wrapper">
							<image class="xray-photo" :src="record.imagePath" mode="aspectFit" />
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
							<text class="measurement-value">{{record.result?.cobbAngle || 0}}</text>
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

				<!-- 双肺检测卡片 -->
				<view class="lung-card" v-if="record.result?.lungHealth">
					<view class="card-header">
						<view class="card-icon orange">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M12 22c-4.97 0-9-2.582-9-7v-1c0-2.757 2.243-5 5-5h8c2.757 0 5 2.243 5 5v1c0 4.418-4.03 7-9 7z" stroke="#FFFFFF" stroke-width="2"/>
								<path d="M5 8v2c0 2.485 2.015 4.5 4.5 4.5h5c2.485 0 4.5-2.015 4.5-4.5V8M8 8V6a4 4 0 018 0v2" stroke="#FFFFFF" stroke-width="2"/>
							</svg>
						</view>
						<text class="card-title">双肺检测</text>
						<view class="confidence-badge" v-if="record.result?.lungConfidence" :class="getConfidenceClass()">
							<text class="confidence-text">{{getConfidenceText()}}</text>
						</view>
					</view>
					<view class="lung-status">
						<text class="status-label">脊柱侧弯对肺部影响</text>
						<text class="status-value" :class="getLungClass()">{{record.result?.lungHealth || '未检测'}}</text>
					</view>
					<view class="lung-details" v-if="record.result?.lungAffectedDetails">
						<text class="details-text">{{record.result?.lungAffectedDetails}}</text>
					</view>
				</view>

				<!-- 分析详情卡片 -->
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
							<text class="info-value">{{record.result?.curveType || '-'}}</text>
						</view>
						<view class="info-item">
							<text class="info-label">弯曲位置</text>
							<text class="info-value">{{record.result?.curveLocation || '-'}}</text>
						</view>
						<view class="info-item">
							<text class="info-label">弯曲方向</text>
							<text class="info-value">{{record.result?.curveDirection || '-'}}</text>
						</view>
						<view class="info-item">
							<text class="info-label">椎体旋转</text>
							<text class="info-value" :class="{highlight: record.result?.vertebralRotation !== '无'}">{{record.result?.vertebralRotation || '-'}}</text>
						</view>
						<view class="info-item wide">
							<text class="info-label">受累椎体</text>
							<text class="info-value">{{record.result?.affectedVertebrae || '-'}}</text>
						</view>
					</view>
				</view>

				<!-- 手术信息卡片 -->
				<view class="feature-card surgery" v-if="record.result?.postSurgical">
					<view class="card-header">
						<view class="card-icon purple">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M12 6v12m0 0l-3-3m3 3l3-3" stroke="#FFFFFF" stroke-width="2"/>
							</svg>
						</view>
						<text class="card-title">手术信息</text>
					</view>
					<view class="detail-box" v-if="record.result?.postSurgicalDetails">
						<text class="detail-content">{{record.result?.postSurgicalDetails}}</text>
					</view>
				</view>

				<!-- AI建议卡片 -->
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
						<view class="advice-item" v-for="(item, index) in record.result?.recommendations" :key="index">
							<view class="advice-number">{{index + 1}}</view>
							<text class="advice-content">{{item}}</text>
						</view>
					</view>
				</view>

				<!-- 报告总结卡片 -->
				<view class="feature-card summary" v-if="record.result?.summary">
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
						<text class="summary-text">{{record.result?.summary}}</text>
					</view>
				</view>
			</template>

			<!-- 后背照片结果 -->
			<template v-if="recordType === 'photo'">
				<!-- 结果卡片 -->
				<view class="photo-result-card">
					<view class="card-accent"></view>
					<view class="risk-ring">
						<view class="ring-bg" :style="{ background: getRiskBgColor() }"></view>
						<svg viewBox="0 0 120 120" class="ring-svg">
							<circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" stroke-width="10"/>
							<circle cx="60" cy="60" r="50" fill="none" :stroke="getRiskColor()" stroke-width="10" :stroke-dasharray="getRiskDashArray()" stroke-linecap="round" transform="rotate(-90 60 60)"/>
						</svg>
						<view class="ring-center">
							<text class="risk-level" :style="{ color: getRiskColor() }">{{getRiskLevelText()}}</text>
						</view>
					</view>
					<text class="result-title">筛查结果：{{getRiskTitle()}}</text>
					<text class="result-desc">{{record?.result?.summary || '分析完成'}}</text>
				</view>

				<!-- 分析图片 -->
				<view class="analysis-section" v-if="record?.imagePath">
					<text class="section-title">分析图片</text>
					<view class="annotation-image">
						<image :src="record.imagePath" mode="aspectFit"/>
					</view>
					<text class="image-hint">AI 脊柱侧弯分析图</text>
				</view>

				<!-- 核心基础判断 -->
				<view class="assessment-section" v-if="assessmentList.length > 0">
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

				<!-- AI建议 -->
				<view class="advice-section" v-if="getRecommendations().length > 0">
					<text class="section-title">AI建议</text>
					<view class="advice-card">
						<view class="advice-item" v-for="(item, index) in getRecommendations()" :key="index">
							<view class="advice-icon">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M9 12l2 2 4-4" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</view>
							<text class="advice-text">{{item}}</text>
						</view>
					</view>
				</view>
			</template>

			<!-- 警告提示 -->
			<view class="warning-card">
				<view class="warning-icon-wrapper">
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="#D97706" stroke-width="1.8"/>
						<path d="M12 8v4M12 16h.01" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</view>
				<text class="warning-text">{{recordType === 'xray' ? '建议咨询脊柱外科医生，本AI报告仅供辅助筛查参考，不构成医疗诊断，需结合临床体征综合评估。' : '如持续不适或发现体态明显异常，建议前往正规医院骨科或脊柱外科就诊，由专业医生进行详细检查。'}}</text>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons" v-if="recordType === 'xray'">
				<view class="danger-btn btn-full" @tap="deleteRecord">删除此记录</view>
				<view class="primary-btn btn-full" @tap="reTest">重新检测</view>
			</view>

			<text class="disclaimer">本结果仅为辅助筛查参考，不构成医疗诊断</text>
		</view>
	</view>
</template>

<script>
import { deleteRecord } from '@/utils/storage.js'

export default {
	data() {
		return {
			record: null,
			recordType: 'photo',
			assessmentList: []
		}
	},
	onLoad(options) {
		if (options.record) {
			this.record = JSON.parse(decodeURIComponent(options.record))
			this.recordType = this.record.type
			this.buildAssessmentList()
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		buildAssessmentList() {
			const detailedAssessment = this.record?.result?.detailedAssessment
			if (!detailedAssessment) {
				this.assessmentList = []
				return
			}

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
			this.assessmentList = list
		},
		getRiskColor() {
			const riskLevel = this.record?.result?.riskLevel
			if (riskLevel === 'low') return '#059669'
			if (riskLevel === 'medium') return '#D97706'
			if (riskLevel === 'high') return '#DC2626'
			return '#059669'
		},
		getRiskBgColor() {
			const riskLevel = this.record?.result?.riskLevel
			if (riskLevel === 'low') return 'rgba(5, 150, 105, 0.5)'
			if (riskLevel === 'medium') return 'rgba(217, 119, 6, 0.5)'
			if (riskLevel === 'high') return 'rgba(220, 38, 38, 0.5)'
			return 'rgba(5, 150, 105, 0.5)'
		},
		getRiskDashArray() {
			const riskLevel = this.record?.result?.riskLevel
			if (riskLevel === 'low') return '88 220'
			if (riskLevel === 'medium') return '110 220'
			return '154 220'
		},
		getRiskLevelText() {
			const riskLevel = this.record?.result?.riskLevel
			if (riskLevel === 'low') return '低'
			if (riskLevel === 'medium') return '中'
			if (riskLevel === 'high') return '高'
			return '低'
		},
		getRiskTitle() {
			const riskLevel = this.record?.result?.riskLevel
			if (riskLevel === 'low') return '低风险'
			if (riskLevel === 'medium') return '中风险'
			if (riskLevel === 'high') return '高风险'
			return '低风险'
		},
		getSeverityText() {
			const angle = this.record?.result?.cobbAngle || 0
			if (angle < 10) return '正常范围'
			if (angle < 25) return '轻度侧弯'
			if (angle < 40) return '中度侧弯'
			if (angle < 60) return '重度侧弯'
			return '极重度侧弯'
		},
		getSeverityClass() {
			const angle = this.record?.result?.cobbAngle || 0
			if (angle < 10) return 'normal'
			if (angle < 25) return 'mild'
			if (angle < 40) return 'moderate'
			if (angle < 60) return 'severe'
			return 'extreme'
		},
		getLungClass() {
			if (!this.record || !this.record.result?.lungHealth) return ''
			const health = this.record.result.lungHealth
			if (health.includes('正常')) return 'lung-normal'
			if (health.includes('轻度')) return 'lung-mild'
			if (health.includes('中度')) return 'lung-moderate'
			if (health.includes('重度')) return 'lung-severe'
			return ''
		},
		getConfidenceText() {
			if (!this.record || !this.record.result?.lungConfidence) return ''
			const confidence = this.record.result.lungConfidence
			if (confidence === 'low') return '可信度低'
			if (confidence === 'medium') return '可信度中'
			if (confidence === 'high') return '可信度高'
			return ''
		},
		getConfidenceClass() {
			if (!this.record || !this.record.result?.lungConfidence) return ''
			const confidence = this.record.result.lungConfidence
			if (confidence === 'low') return 'confidence-low'
			if (confidence === 'medium') return 'confidence-medium'
			if (confidence === 'high') return 'confidence-high'
			return ''
		},
		getMarkerPosition() {
			const angle = this.record?.result?.cobbAngle || 0
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
		getValueClass(value, keywords) {
			if (!value) return 'safe'
			for (let keyword of keywords) {
				if (value.includes(keyword)) {
					return 'warning'
				}
			}
			return 'safe'
		},
		getRecommendations() {
			return this.record?.result?.recommendations || []
		},
		deleteRecord() {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条记录吗？',
				success: (res) => {
					if (res.confirm && this.record?.id) {
						deleteRecord(this.record.id)
						uni.navigateBack()
					}
				}
			})
		},
		reTest() {
			if (this.recordType === 'photo') {
				uni.navigateTo({
					url: '/pages/photo/upload'
				})
			} else {
				uni.navigateTo({
					url: '/pages/xray/upload'
				})
			}
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
	align-items: center;
	gap: 16rpx;
	padding: 28rpx 40rpx;
	background: #FFFFFF;
	border-bottom: 2rpx solid #E2E8F0;
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

.header-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #0F172A;
	flex: 1;
}

.type-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 8rpx 24rpx;
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 600;
	background: #F0FDFA;
	color: #115E59;
}

.content {
	padding: 24rpx;
}

/* X光片主卡片 */
.result-card {
	background: #FFFFFF;
	border-radius: 28rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	display: flex;
	margin-bottom: 20rpx;
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

/* 双肺检测卡片 */
.lung-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
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

.status-value.lung-normal { color: #059669; }
.status-value.lung-mild { color: #D97706; }
.status-value.lung-moderate { color: #EA580C; }
.status-value.lung-severe { color: #DC2626; }

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

.confidence-badge.confidence-low .confidence-text { color: #DC2626; }
.confidence-badge.confidence-medium .confidence-text { color: #B45309; }
.confidence-badge.confidence-high .confidence-text { color: #065F46; }

/* 分析详情卡片 */
.info-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
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

.card-icon.blue { background: #EEF2FF; }
.card-icon.purple { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); }
.card-icon.green { background: #059669; }
.card-icon.teal { background: #0EA5E9; }

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

/* 手术信息卡片 */
.feature-card.surgery {
	background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
	border-radius: 24rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
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

/* 建议卡片 */
.feature-card.advice {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
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

/* 报告总结卡片 */
.feature-card.summary {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
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

/* 后背照片结果样式 */
.photo-result-card {
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

.action-buttons {
	display: flex;
	gap: 28rpx;
	margin-bottom: 40rpx;
}

.btn-full {
	flex: 1;
}

.danger-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 26rpx 0;
	border-radius: 999rpx;
	background: transparent;
	color: #DC2626;
	font-size: 28rpx;
	font-weight: 600;
	border: 3rpx solid #DC2626;
}

.primary-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 26rpx 0;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
	color: #FFFFFF;
	font-size: 28rpx;
	font-weight: 600;
	box-shadow: 0 8rpx 28rpx rgba(13, 148, 136, 0.25);
}

.disclaimer {
	font-size: 22rpx;
	color: #94A3B8;
	text-align: center;
	line-height: 1.7;
	padding: 20rpx 0 40rpx;
	display: block;
}
</style>
