Page({
  data: {},
  onLoad: function () {},
  goBack: function () {
    wx.navigateBack()
  },
  chooseImage: function () {
    this.chooseFromAlbum()
  },
  chooseFromAlbum: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.goToLoading(res.tempFilePaths[0], 'xray')
      }
    })
  },
  goToLoading: function (imagePath, mode) {
    wx.setStorageSync('detectImage', imagePath)
    wx.setStorageSync('detectMode', mode)
    wx.navigateTo({
      url: '/pages/loading/index'
    })
  }
})