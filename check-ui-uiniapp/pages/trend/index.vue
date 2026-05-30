<template>
	<view class="container">
		<view class="page-header">
			<text class="header-title">检测趋势对比</text>
		</view>

		<view class="content">
			<view class="tab-bar">
				<view class="tab" :class="{'active': activeTab === 'photo'}" @tap="switchTab('photo')">后背照片</view>
				<view class="tab" :class="{'active': activeTab === 'xray'}" @tap="switchTab('xray')">X光片</view>
			</view>

			<view class="chart-card">
				<text class="chart-title">{{activeTab === 'photo' ? '风险等级趋势' : 'Cobb角度变化'}}</text>
				<view class="bar-chart">
					<view class="bar-item">
						<view class="bar safe" style="height: 70rpx;"></view>
						<text class="bar-label">检测1</text>
					</view>
					<view class="bar-item">
						<view class="bar safe" style="height: 80rpx;"></view>
						<text class="bar-label">检测2</text>
					</view>
					<view class="bar-item">
						<view class="bar warning" style="height: 110rpx;"></view>
						<text class="bar-label">检测3</text>
					</view>
				</view>
				<text class="chart-hint">{{activeTab === 'photo' ? '风险等级' : 'Cobb角度 (°)'}}</text>
			</view>

			<view class="table-card">
				<text class="table-title">数据对比</text>
				<view class="table">
					<view class="table-header">
						<text>日期</text>
						<text>类型</text>
						<text>结果</text>
					</view>
					<view class="table-row">
						<text>2024-03-15</text>
						<view class="type-badge blue">X光片</view>
						<text class="result warning">18°</text>
					</view>
					<view class="table-row">
						<text>2024-02-20</text>
						<view class="type-badge teal">后背照片</view>
						<text class="result safe">低风险</text>
					</view>
					<view class="table-row">
						<text>2024-01-10</text>
						<view class="type-badge teal">后背照片</view>
						<text class="result safe">低风险</text>
					</view>
				</view>
			</view>

			<text class="summary">近3次检测结果显示，脊柱侧弯风险呈稳定趋势</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			activeTab: 'photo'
		}
	},
	methods: {
		switchTab(tab) {
			this.activeTab = tab
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F5F7FA;
}

.page-header {
	padding: 28rpx 40rpx;
	background: #FFFFFF;
	border-bottom: 2rpx solid #E2E8F0;
}

.header-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #0F172A;
}

.content {
	padding: 40rpx;
}

.tab-bar {
	display: flex;
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 8rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
}

.tab {
	flex: 1;
	padding: 20rpx 0;
	text-align: center;
	font-size: 28rpx;
	font-weight: 600;
	color: #64748B;
	border-radius: 16rpx;
	transition: all 0.3s ease;
}

.tab.active {
	background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
	color: #FFFFFF;
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.25);
}

.chart-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
}

.chart-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 40rpx;
	display: block;
}

.bar-chart {
	display: flex;
	justify-content: space-around;
	align-items: flex-end;
	height: 240rpx;
	margin-bottom: 24rpx;
}

.bar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.bar {
	width: 80rpx;
	border-radius: 16rpx 16rpx 0 0;
}

.bar.safe {
	background: linear-gradient(180deg, #059669 0%, #10B981 100%);
}

.bar.warning {
	background: linear-gradient(180deg, #D97706 0%, #F59E0B 100%);
}

.bar.danger {
	background: linear-gradient(180deg, #DC2626 0%, #EF4444 100%);
}

.bar-label {
	font-size: 22rpx;
	color: #94A3B8;
}

.chart-hint {
	font-size: 22rpx;
	color: #94A3B8;
	text-align: center;
	display: block;
}

.table-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
}

.table-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 32rpx;
	display: block;
}

.table {
	display: flex;
	flex-direction: column;
}

.table-header {
	display: flex;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #F1F5F9;
}

.table-header text {
	flex: 1;
	font-size: 24rpx;
	font-weight: 600;
	color: #64748B;
	text-align: center;
}

.table-row {
	display: flex;
	padding: 24rpx 0;
	align-items: center;
	border-bottom: 2rpx solid #F1F5F9;
}

.table-row:last-child {
	border-bottom: none;
}

.table-row text {
	flex: 1;
	font-size: 26rpx;
	color: #0F172A;
	text-align: center;
}

.type-badge {
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 8rpx 24rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
}

.type-badge.teal {
	background: #CCFBF1;
	color: #115E59;
}

.type-badge.blue {
	background: #E0E7FF;
	color: #4338CA;
}

.result {
	font-weight: 600;
}

.result.safe {
	color: #059669;
}

.result.warning {
	color: #D97706;
}

.result.danger {
	color: #DC2626;
}

.summary {
	font-size: 26rpx;
	color: #475569;
	text-align: center;
	line-height: 1.6;
	display: block;
}
</style>
