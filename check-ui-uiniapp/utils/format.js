// 格式化工具
export function formatDate(dateString) {
	const date = new Date(dateString)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export function formatTime(dateString) {
	const date = new Date(dateString)
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	return `${hours}:${minutes}`
}

export function getRiskLevel(riskLevel) {
	if (riskLevel === 'low') return { text: '低风险', color: '#059669' }
	if (riskLevel === 'medium') return { text: '中风险', color: '#D97706' }
	if (riskLevel === 'high') return { text: '高风险', color: '#DC2626' }
	return { text: '未知', color: '#94A3B8' }
}
