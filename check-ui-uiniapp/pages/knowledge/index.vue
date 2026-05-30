<template>
	<view class="container">
		<view class="page-header">
			<text class="header-title">脊柱健康科普</text>
		</view>

		<view class="content">
			<view class="knowledge-grid">
				<view class="knowledge-card" v-for="item in topics" :key="item.title">
					<view class="card-icon">
						<svg viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" stroke="#0D9488" stroke-width="1.8"/>
							<path d="M12 8v4M12 16h.01" stroke="#0D9488" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</view>
					<text class="card-title">{{item.title}}</text>
					<text class="card-desc">{{item.desc}}</text>
				</view>
			</view>

			<text class="source">内容来源：中华医学会骨科学分会</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			topics: [
				{
					title: '什么是脊柱侧弯',
					desc: '脊柱侧弯是一种脊柱的三维畸形，包括冠状面、矢状面和水平面上的序列异常。'
				},
				{
					title: '如何早期发现',
					desc: '通过观察双肩是否等高、肩胛骨是否对称、向前弯腰时背部是否平等方法自查。'
				},
				{
					title: 'Cobb角是什么',
					desc: 'Cobb角是评估脊柱侧弯严重程度的标准，正常范围在10°以内。'
				},
				{
					title: '日常预防措施',
					desc: '保持正确坐姿睡姿，加强背部肌肉锻炼，避免长期单侧负重。'
				},
				{
					title: '康复训练方法',
					desc: 'Schroth训练、核心肌群锻炼、姿势矫正训练等可有效改善轻度侧弯。'
				},
				{
					title: '何时需要手术',
					desc: '当Cobb角超过40°且持续进展时，通常需要考虑手术治疗。'
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

.knowledge-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 28rpx;
	margin-bottom: 40rpx;
}

.knowledge-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid #F1F5F9;
}

.card-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 24rpx;
	background: #F0FDFA;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 28rpx;
}

.card-icon svg {
	width: 40rpx;
	height: 40rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #0F172A;
	margin-bottom: 16rpx;
	display: block;
}

.card-desc {
	font-size: 26rpx;
	color: #64748B;
	line-height: 1.7;
	display: block;
}

.source {
	font-size: 22rpx;
	color: #94A3B8;
	text-align: center;
	display: block;
}
</style>
