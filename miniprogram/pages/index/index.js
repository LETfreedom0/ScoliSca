Page({
  data: {},
  onLoad: function () {},
  goToPhotoUpload: function () {
    wx.navigateTo({
      url: '/pages/photo/upload'
    })
  },
  goToXrayUpload: function () {
    wx.navigateTo({
      url: '/pages/xray/upload'
    })
  },
  goToHistory: function () {
    wx.navigateTo({
      url: '/pages/history/list'
    })
  },
  goToKnowledge: function () {
    wx.navigateTo({
      url: '/pages/knowledge/index'
    })
  }
})