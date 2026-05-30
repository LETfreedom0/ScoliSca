const API_BASE_URL = 'http://localhost:3000'

module.exports = {
  API_BASE_URL,
  
  analyzeImage: `${API_BASE_URL}/api/analyze`,
  uploadFile: `${API_BASE_URL}/api/files/upload`,
  getConfig: `${API_BASE_URL}/api/config`,
  diagnose: `${API_BASE_URL}/api/diagnose`,
}