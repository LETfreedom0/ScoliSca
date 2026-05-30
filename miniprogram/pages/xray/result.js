const app = getApp()

Page({
  data: {
    imagePath: '',
    result: null,
    success: false,
    error: null,
    riskLevel: '',
    riskText: '',
    riskColor: '',
    timestamp: ''
  },
  onLoad: function () {
    const imagePath = wx.getStorageSync('detectImage')
    const success = wx.getStorageSync('analysisSuccess')
    const result = wx.getStorageSync('analysisResult')
    const error = wx.getStorageSync('analysisError')

    this.setData({
      imagePath: imagePath,
      success: success,
      result: result,
      error: error,
      timestamp: this.formatDate(new Date())
    })

    if (success && result) {
      this.processResult(result)
    }
  },
  processResult: function (result) {
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

    this.setData({
      riskText: riskText,
      riskColor: riskColor
    })
  },
  formatDate: function (date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },
  goBack: function () {
    wx.navigateBack()
  },
  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  saveReport: function () {
    wx.showToast({
      title: '报告已保存',
      icon: 'success'
    })
  },
  onShareAppMessage: function () {
    const result = this.data.result
    if (result && result.summary) {
      return {
        title: '脊安AI分析报告',
        desc: result.summary.substring(0, 50)
      }
    }
    return {
      title: '脊安AI分析报告',
      desc: '脊柱X光片AI分析'
    }
  }
})