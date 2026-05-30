Page({
  data: {
    recordType: 'photo'
  },
  onLoad: function (options) {
    if (options && options.type) {
      this.setData({
        recordType: options.type
      })
    }
  },
  goBack: function () {
    wx.navigateBack()
  },
  deleteRecord: function () {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },
  reTest: function () {
    const url = this.data.recordType === 'photo' 
      ? '/pages/photo/upload' 
      : '/pages/xray/upload'
    wx.navigateTo({
      url: url
    })
  }
})