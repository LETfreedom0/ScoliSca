<template>
	<view class="page-container">
		<view class="nav-header">
			<view class="header-left">
				<text class="page-title">历史记录</text>
				<text class="page-subtitle">脊柱健康筛查记录</text>
			</view>
		</view>

		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<view class="record-count-wrap">
					<text class="record-count">共 {{records.length}} 条记录</text>
				</view>

				<view class="record-list">
					<view
						class="swipe-container"
						v-for="item in records"
						:key="item.id"
					>
						<view
							class="del-btn"
							@tap="deleteSingle(item.id)"
						>
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</view>
						<view
							class="record-item"
							@tap="goToDetail(item)"
							@touchstart="touchStart"
							@touchmove="touchMove"
							@touchend="touchEnd"
							:data-id="item.id"
							:style="{transform: `translateX(${delBtnStatus[item.id] || 0}px)`}"
						>
							<view class="record-icon-wrap">
								<view class="record-icon" :class="item.type">
									<svg v-if="item.type === 'xray'" viewBox="0 0 24 24" fill="none">
										<rect x="4" y="2" width="16" height="20" rx="3" stroke="#4F46E5" stroke-width="1.8" fill="none"/>
										<path d="M7 7h10M7 11h8M7 15h6" stroke="#4F46E5" stroke-width="1.8" stroke-linecap="round"/>
									</svg>
									<svg v-else viewBox="0 0 24 24" fill="none">
										<rect x="3" y="6" width="18" height="13" rx="2" stroke="#0D9488" stroke-width="1.8" fill="none"/>
										<circle cx="12" cy="12.5" r="3" stroke="#0D9488" stroke-width="1.8" fill="none"/>
									</svg>
								</view>
							</view>
							<view class="record-info">
								<view class="record-header">
									<view class="left-badges">
										<view class="type-badge" :class="item.type === 'xray' ? 'blue' : 'teal'">
											{{item.type === 'xray' ? 'X光片' : '后背照片'}}
										</view>
										<view class="risk-badge" :class="getRiskClass(item.result?.riskLevel)" v-if="item.type === 'photo' && item.result?.riskLevel">
											<view class="risk-dot"></view>
											<text>{{getRiskShortText(item.result?.riskLevel)}}风险</text>
										</view>
									</view>
									<text class="record-date">{{item.date}}</text>
								</view>
								<text class="record-result" :class="{'normal': isNormal(item)}" v-if="item.type === 'photo'">{{getAbnormalSignsText(item.result)}}</text>
								<text class="record-result" v-else>{{getResultText(item)}}</text>
							</view>
							<view class="record-arrow">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M9 6l6 6-6 6" stroke="#C0C8D0" stroke-width="2" stroke-linecap="round"/>
								</svg>
							</view>
						</view>
					</view>
				</view>

				<text class="swipe-hint">← 左滑可删除单条记录</text>

				<view class="clear-all" @tap="clearAll">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#DC2626" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<text>清空全部记录</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { getRecords, deleteRecord, clearAllRecords } from '@/utils/storage.js'

export default {
	data() {
		return {
			records: [],
			delBtnStatus: {},
			touchStartX: 0,
			delBtnWidth: 120
		}
	},
	onShow() {
		this.loadRecords()
	},
	methods: {
		loadRecords() {
			this.records = getRecords()
		},
		getResultText(item) {
			if (item.type === 'xray') {
				return item.result?.cobbAngle ? `${item.result.cobbAngle}° ${this.getSeverityText(item.result.cobbAngle)}` : 'X光片分析'
			} else {
				return item.result?.riskLevel ? this.getRiskText(item.result.riskLevel) : '后背照片分析'
			}
		},
		getAbnormalSignsText(result) {
			if (!result) return '后背照片分析'
			const abnormalSigns = result.abnormalSigns || []
			if (abnormalSigns.length > 0) {
				return abnormalSigns.join('、')
			}
			return '体态基本正常'
		},
		isNormal(item) {
			if (item.type !== 'photo') return false
			const abnormalSigns = item.result?.abnormalSigns || []
			return abnormalSigns.length === 0
		},
		getSeverityText(angle) {
			if (angle < 10) return '正常'
			if (angle < 25) return '轻度'
			if (angle < 40) return '中度'
			if (angle < 60) return '重度'
			return '极重度'
		},
		getSeverityShortText(angle) {
			if (angle < 10) return '正常'
			if (angle < 25) return '轻度'
			if (angle < 40) return '中度'
			if (angle < 60) return '重度'
			return '极重度'
		},
		getSeverityClass(angle) {
			if (!angle) return 'severity-unknown'
			if (angle < 10) return 'severity-normal'
			if (angle < 25) return 'severity-mild'
			if (angle < 40) return 'severity-moderate'
			if (angle < 60) return 'severity-severe'
			return 'severity-extreme'
		},
		getRiskText(riskLevel) {
			if (riskLevel === 'low') return '低风险'
			if (riskLevel === 'medium') return '中风险'
			if (riskLevel === 'high') return '高风险'
			return '未知'
		},
		getRiskShortText(riskLevel) {
			if (riskLevel === 'low') return '低'
			if (riskLevel === 'medium') return '中'
			if (riskLevel === 'high') return '高'
			return '-'
		},
		getRiskClass(riskLevel) {
			if (riskLevel === 'low') return 'risk-low'
			if (riskLevel === 'medium') return 'risk-medium'
			if (riskLevel === 'high') return 'risk-high'
			return 'risk-unknown'
		},
		goToDetail(item) {
			uni.navigateTo({
				url: `/pages/history/detail?record=${encodeURIComponent(JSON.stringify(item))}`
			})
		},
		deleteSingle(id) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条记录吗？',
				success: (res) => {
					if (res.confirm) {
						deleteRecord(id)
						this.loadRecords()
					}
				}
			})
		},
		clearAll() {
			uni.showModal({
				title: '确认清空',
				content: '确定要清空所有记录吗？此操作不可恢复。',
				success: (res) => {
					if (res.confirm) {
						clearAllRecords()
						this.loadRecords()
					}
				}
			})
		},
		touchStart(e) {
			this.touchStartX = e.touches[0].clientX
		},
		touchMove(e) {
			const currentX = e.touches[0].clientX
			const diffX = this.touchStartX - currentX
			const id = e.currentTarget.dataset.id

			if (diffX > 0) {
				this.delBtnStatus[id] = Math.min(diffX, this.delBtnWidth)
			} else {
				this.delBtnStatus[id] = Math.max(diffX, 0)
			}
		},
		touchEnd(e) {
			const id = e.currentTarget.dataset.id
			if (this.delBtnStatus[id] > this.delBtnWidth / 2) {
				this.delBtnStatus[id] = this.delBtnWidth
			} else {
				this.delBtnStatus[id] = 0
			}
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

.content-scroll {
	flex: 1;
	height: calc(100vh - 140rpx);
}

.content {
	padding: 24rpx;
}

.record-count-wrap {
	margin-bottom: 24rpx;
}

.record-count {
	font-size: 26rpx;
	color: #64748B;
	font-weight: 500;
}

.record-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.swipe-container {
	position: relative;
	overflow: hidden;
	border-radius: 24rpx;
}

.del-btn {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	width: 120rpx;
	background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
	border-radius: 0 24rpx 24rpx 0;
}

.del-btn svg {
	width: 40rpx;
	height: 40rpx;
}

.record-item {
	position: relative;
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 28rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
	display: flex;
	align-items: flex-start;
	gap: 24rpx;
	z-index: 2;
	transition: transform 0.2s ease;
}

.record-icon-wrap {
	flex-shrink: 0;
}

.record-icon {
	width: 88rpx;
	height: 88rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.record-icon.xray {
	background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
}

.record-icon.photo {
	background: linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%);
}

.record-icon svg {
	width: 44rpx;
	height: 44rpx;
}

.record-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.record-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 12rpx;
}

.left-badges {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-wrap: wrap;
}

.type-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 6rpx 20rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
}

.type-badge.teal {
	background: linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%);
	color: #115E59;
}

.type-badge.blue {
	background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
	color: #4338CA;
}

.risk-badge {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 6rpx 16rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 600;
}

.risk-badge.risk-low {
	background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
	color: #065F46;
}

.risk-badge.risk-medium {
	background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
	color: #B45309;
}

.risk-badge.risk-high {
	background: linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%);
	color: #991B1B;
}

.risk-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
}

.risk-badge.risk-low .risk-dot {
	background: #22C55E;
}

.risk-badge.risk-medium .risk-dot {
	background: #F59E0B;
}

.risk-badge.risk-high .risk-dot {
	background: #EF4444;
}

.record-date {
	font-size: 24rpx;
	color: #94A3B8;
	font-weight: 500;
}

.result-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.record-result {
	font-size: 26rpx;
	font-weight: 500;
	color: #64748B;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.record-result.normal {
	color: #059669;
}

.severity-badge {
	padding: 6rpx 16rpx;
	border-radius: 16rpx;
	font-size: 20rpx;
	font-weight: 600;
}

.severity-badge.severity-normal {
	background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
	color: #065F46;
}

.severity-badge.severity-mild {
	background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
	color: #B45309;
}

.severity-badge.severity-moderate {
	background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%);
	color: #9A3412;
}

.severity-badge.severity-severe {
	background: linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%);
	color: #991B1B;
}

.severity-badge.severity-extreme {
	background: linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%);
	color: #831843;
}

.risk-badge {
	padding: 6rpx 16rpx;
	border-radius: 16rpx;
	font-size: 20rpx;
	font-weight: 600;
}

.risk-badge.risk-low {
	background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
	color: #065F46;
}

.risk-badge.risk-medium {
	background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
	color: #B45309;
}

.risk-badge.risk-high {
	background: linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%);
	color: #991B1B;
}

.record-arrow {
	opacity: 0.4;
	flex-shrink: 0;
	align-self: center;
}

.record-arrow svg {
	width: 32rpx;
	height: 32rpx;
}

.swipe-hint {
	font-size: 22rpx;
	color: #94A3B8;
	text-align: center;
	margin-top: 24rpx;
	display: block;
}

.clear-all {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	margin-top: 48rpx;
	padding: 24rpx;
	background: #FFFFFF;
	border-radius: 20rpx;
	border: 2rpx solid #FEE2E2;
}

.clear-all svg {
	width: 36rpx;
	height: 36rpx;
}

.clear-all text {
	font-size: 28rpx;
	color: #DC2626;
	font-weight: 600;
}
</style>
