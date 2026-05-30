Page({
  data: {
    activeTab: 'photo'
  },
  onLoad: function () {},
  switchTab: function (tab) {
    this.setData({ activeTab: tab })
  }
})