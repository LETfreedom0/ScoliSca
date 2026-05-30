Page({
  data: {},
  onLoad: function () {},
  goBack: function () {
    wx.navigateBack()
  },
  chooseImage: function () {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseFromAlbum()
        } else {
          this.takePhoto()
        }
      }
    })
  },
  chooseFromAlbum: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.goToLoading(res.tempFilePaths[0], 'photo')
      }
    })
  },
  takePhoto: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.goToLoading(res.tempFilePaths[0], 'photo')
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