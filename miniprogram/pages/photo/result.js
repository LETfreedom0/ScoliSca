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
    timestamp: '',
    assessmentList: []
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

    const assessmentList = this.buildAssessmentList(result.detailedAssessment)

    this.setData({
      riskText: riskText,
      riskColor: riskColor,
      assessmentList: assessmentList
    })
  },
  buildAssessmentList: function (detailedAssessment) {
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
        title: '脊安AI筛查报告',
        desc: result.summary.substring(0, 50)
      }
    }
    return {
      title: '脊安AI筛查报告',
      desc: '低风险 - 脊柱轮廓基本对称'
    }
  }
})
