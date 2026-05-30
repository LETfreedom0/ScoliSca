const api = require('../../config/api')

Page({
  data: {
    currentMessage: '',
    isPhoto: true,
    analyzing: true,
    error: null
  },
  onLoad: function () {
    const mode = wx.getStorageSync('detectMode') || 'photo'
    this.setData({
      isPhoto: mode === 'photo'
    })

    this.startAnalyze()
  },
  startAnalyze: function () {
    const isPhoto = this.data.isPhoto
    const msgs = isPhoto
      ? ['正在识别脊柱轮廓…', '正在分析肩部平衡…', '正在评估骨盆倾斜…', '生成筛查报告…']
      : ['正在定位脊柱椎体…', '正在测量Cobb角度…', '正在评估侧弯类型…', '生成分析报告…']

    let step = 0
    this.setData({ currentMessage: msgs[step] })

    const interval = setInterval(() => {
      step = (step + 1) % 4
      this.setData({ currentMessage: msgs[step] })
    }, 1600)

    this.uploadAndAnalyze(isPhoto, interval)
  },
  saveToHistory: function (result, type, imagePath) {
    try {
      const history = wx.getStorageSync('analysisHistory') || []

      const newRecord = {
        id: Date.now(),
        type: type,
        date: this.formatDate(new Date()),
        result: result.summary ? result.summary.substring(0, 50) : (type === 'photo' ? '后背照片筛查' : 'X光片分析'),
        level: result.riskLevel || 'unknown',
        imagePath: imagePath || '',
        data: result
      }

      history.unshift(newRecord)

      if (history.length > 100) {
        history.pop()
      }

      wx.setStorageSync('analysisHistory', history)
    } catch (e) {
      console.error('保存历史记录失败:', e)
    }
  },
  formatDate: function (date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },
  uploadAndAnalyze: async function (isPhoto, interval) {
    try {
      const imagePath = wx.getStorageSync('detectImage')

      if (!imagePath) {
        throw new Error('未找到图片')
      }

      const uploadRes = await this.uploadImage(imagePath)

      if (!uploadRes.success) {
        throw new Error(uploadRes.error || '图片上传失败')
      }

      const imageUrl = uploadRes.data.url

      const analyzeRes = await this.analyzeImage(imageUrl, isPhoto ? 'photo' : 'xray')

      clearInterval(interval)

      if (!analyzeRes.success) {
        throw new Error(analyzeRes.error || '分析失败')
      }

      wx.setStorageSync('analysisResult', analyzeRes.data)
      wx.setStorageSync('analysisSuccess', true)

      this.saveToHistory(analyzeRes.data, isPhoto ? 'photo' : 'xray', imagePath)

      const resultUrl = isPhoto ? '/pages/photo/result' : '/pages/xray/result'
      wx.redirectTo({
        url: resultUrl
      })

    } catch (error) {
      clearInterval(interval)

      console.error('分析失败:', error)

      wx.setStorageSync('analysisSuccess', false)
      wx.setStorageSync('analysisError', error.message || '分析失败')

      const resultUrl = isPhoto ? '/pages/photo/result' : '/pages/xray/result'
      wx.redirectTo({
        url: resultUrl
      })
    }
  },
  uploadImage: function (filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: api.uploadFile,
        filePath: filePath,
        name: 'file',
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (e) {
            reject(new Error('解析上传响应失败'))
          }
        },
        fail: (err) => {
          reject(new Error('上传失败: ' + err.errMsg))
        }
      })
    })
  },
  analyzeImage: function (imageUrl, imageType) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: api.analyzeImage,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          image: imageUrl,
          imageType: imageType
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('请求失败: ' + res.statusCode))
          }
        },
        fail: (err) => {
          reject(new Error('请求失败: ' + err.errMsg))
        }
      })
    })
  }
})