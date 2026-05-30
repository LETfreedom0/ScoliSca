// 本地存储工具
const STORAGE_KEY = 'scolisca_records'

export function saveRecord(record) {
	const records = getRecords()
	record.id = Date.now().toString()
	record.timestamp = new Date().toISOString()
	records.unshift(record)
	uni.setStorageSync(STORAGE_KEY, records)
	return record
}

export function getRecords() {
	try {
		return uni.getStorageSync(STORAGE_KEY) || []
	} catch (e) {
		return []
	}
}

export function getRecordById(id) {
	const records = getRecords()
	return records.find(r => r.id === id)
}

export function deleteRecord(id) {
	const records = getRecords()
	const filtered = records.filter(r => r.id !== id)
	uni.setStorageSync(STORAGE_KEY, filtered)
}

export function clearAllRecords() {
	uni.removeStorageSync(STORAGE_KEY)
}
