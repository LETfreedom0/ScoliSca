Page({
  data: {
    records: [],
    deleteBtnWidth: 80,
    startX: 0,
    delBtnStatus: {},
    loading: true
  },
  onLoad: function () {},
  onShow: function () {
    this.loadHistory()
  },
  onPullDownRefresh: function () {
    this.loadHistory()
    wx.stopPullDownRefresh()
  },
  loadHistory: function () {
    try {
      const history = wx.getStorageSync('analysisHistory') || []
      const processedHistory = history.map(item => this.processRecord(item))
      this.setData({
        records: processedHistory,
        loading: false
      })
    } catch (e) {
      console.error('读取历史记录失败:', e)
      this.setData({
        records: [],
        loading: false
      })
    }
  },
  processRecord: function (record) {
    const result = record.data || {}
    let riskLevelText = '未知'

    if (result.riskLevel === 'low') {
      riskLevelText = '低风险'
    } else if (result.riskLevel === 'medium') {
      riskLevelText = '中风险'
    } else if (result.riskLevel === 'high') {
      riskLevelText = '高风险'
    }

    const abnormalSigns = result.abnormalSigns || []
    const abnormalSignsText = abnormalSigns.length > 0
      ? abnormalSigns.join('、')
      : ''

    return {
      ...record,
      riskLevel: result.riskLevel || 'unknown',
      riskLevelText: riskLevelText,
      abnormalSigns: abnormalSigns,
      abnormalSignsText: abnormalSignsText
    }
  },
  goToDetail: function (e) {
    const record = e.currentTarget.dataset.record
    if (record && record.data) {
      wx.setStorageSync('analysisResult', record.data)
      wx.setStorageSync('analysisSuccess', true)
      wx.setStorageSync('detectImage', record.imagePath || '')
      const resultUrl = record.type === 'photo' ? '/pages/photo/result' : '/pages/xray/result'
      wx.navigateTo({
        url: resultUrl
      })
    }
  },
  clearAll: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有检测记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('analysisHistory')
          this.setData({ records: [], delBtnStatus: {} })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },
  touchStart: function (e) {
    this.setData({ startX: e.touches[0].clientX })
    const id = e.currentTarget.dataset.id
    const delBtnStatus = { ...this.data.delBtnStatus }
    Object.keys(delBtnStatus).forEach(key => { delBtnStatus[key] = 0 })
    this.setData({ delBtnStatus })
  },
  touchMove: function (e) {
    const moveX = e.touches[0].clientX
    const diff = this.data.startX - moveX
    const delBtnWidth = this.data.deleteBtnWidth
    let translateX = diff > delBtnWidth ? -delBtnWidth : diff < 0 ? 0 : -diff
    const id = e.currentTarget.dataset.id
    const delBtnStatus = { ...this.data.delBtnStatus }
    delBtnStatus[id] = translateX
    this.setData({ delBtnStatus })
  },
  touchEnd: function (e) {
    const delBtnWidth = this.data.deleteBtnWidth
    const id = e.currentTarget.dataset.id
    const delBtnStatus = { ...this.data.delBtnStatus }
    delBtnStatus[id] = delBtnStatus[id] < -delBtnWidth / 2 ? -delBtnWidth : 0
    this.setData({ delBtnStatus })
  },
  deleteSingle: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const records = this.data.records.filter(item => item.id !== id)
          const delBtnStatus = { ...this.data.delBtnStatus }
          delete delBtnStatus[id]

          wx.setStorageSync('analysisHistory', records)
          this.setData({ records, delBtnStatus })
          wx.showToast({ title: '删除成功', icon: 'success' })
        } else {
          const delBtnStatus = { ...this.data.delBtnStatus }
          delBtnStatus[id] = 0
          this.setData({ delBtnStatus })
        }
      }
    })
  }
})
