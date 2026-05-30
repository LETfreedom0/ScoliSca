<template>
	<view class="container">
		<view class="content">
			<view class="logo-section">
				<view class="logo">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M12 4C12 4 8 10 8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14C16 10 12 4 12 4Z" stroke="white" stroke-width="2" fill="none"/>
						<circle cx="12" cy="14" r="1.5" fill="white"/>
					</svg>
				</view>
				<text class="app-name">脊安 AI 筛查</text>
				<text class="app-version">v1.0.0</text>
			</view>

			<view class="feature-list">
				<view class="feature-item" v-for="item in features" :key="item.title">
					<view class="feature-icon">
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#0D9488" stroke-width="1.8"/>
							<path d="M9 12l2 2 4-4" stroke="#0D9488" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</view>
					<view class="feature-content">
						<text class="feature-title">{{item.title}}</text>
						<text class="feature-desc">{{item.desc}}</text>
					</view>
				</view>
			</view>

			<view class="warning-card">
				<text class="warning-title">免责声明</text>
				<text class="warning-text">本工具仅为脊柱侧弯辅助筛查工具，分析结果仅供参考，不替代专业医生诊断。如发现异常或有任何不适，请及时前往正规医院骨科/脊柱外科就诊，由专业医生进行确诊和治疗。</text>
			</view>

			<view class="privacy-card">
				<text class="privacy-title">隐私承诺</text>
				<text class="privacy-text">本工具不收集、不存储您的任何个人信息及检测数据。所有数据仅保存在您当前使用的设备中，卸载小程序后数据自动清除。</text>
			</view>

			<view class="links">
				<text class="link-item">联系我们</text>
				<text class="link-item">隐私政策</text>
				<text class="link-item">用户协议</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			features: [
				{
					title: 'AI智能分析',
					desc: '采用先进人工智能算法，精准分析脊柱健康状态'
				},
				{
					title: '快速筛查',
					desc: '上传照片即可获得初步筛查结果，无需复杂操作'
				},
				{
					title: '隐私保护',
					desc: '所有数据仅本地存储，保护您的隐私安全'
				},
				{
					title: '持续监测',
					desc: '支持历史记录查看，方便追踪健康趋势变化'
				}
			]
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: #F5F7FA;
}

.content {
	padding: 40rpx;
}

.logo-section {
	text-align: center;
	margin-bottom: 64rpx;
	padding-top: 20rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	border-radius: 48rpx;
	background: linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #2DD4BF 100%);
	margin: 0 auto 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 20rpx 56rpx rgba(13, 148, 136, 0.28);
}

.logo svg {
	width: 80rpx;
	height: 80rpx;
}

.app-name {
	font-size: 44rpx;
	font-weight: 700;
	color: #0F172A;
	letter-spacing: 2rpx;
	display: block;
	margin-bottom: 12rpx;
}

.app-version {
	font-size: 26rpx;
	color: #94A3B8;
}

.feature-list {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 8rpx 0;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
}

.feature-item {
	display: flex;
	align-items: flex-start;
	padding: 32rpx 40rpx;
	border-bottom: 2rpx solid #F1F5F9;
}

.feature-item:last-child {
	border-bottom: none;
}

.feature-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 24rpx;
	background: #F0FDFA;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 28rpx;
	flex-shrink: 0;
}

.feature-icon svg {
	width: 40rpx;
	height: 40rpx;
}

.feature-content {
	flex: 1;
}

.feature-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 8rpx;
	display: block;
}

.feature-desc {
	font-size: 26rpx;
	color: #64748B;
	line-height: 1.6;
	display: block;
}

.warning-card {
	background: linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 100%);
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 28rpx;
	border: 2rpx solid #FDE68A;
}

.warning-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #92400E;
	margin-bottom: 16rpx;
	display: block;
}

.warning-text {
	font-size: 26rpx;
	color: #92400E;
	line-height: 1.8;
	display: block;
}

.privacy-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	border: 2rpx solid #F1F5F9;
}

.privacy-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 16rpx;
	display: block;
}

.privacy-text {
	font-size: 26rpx;
	color: #64748B;
	line-height: 1.8;
	display: block;
}

.links {
	display: flex;
	justify-content: center;
	gap: 48rpx;
}

.link-item {
	font-size: 26rpx;
	color: #0D9488;
	font-weight: 500;
}
</style>
