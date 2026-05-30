const { analyzeWithVisionAI, isUrl } = require('./_lib/analyzer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持 POST 请求' });
  }

  try {
    const { image, openid } = req.body || {};

    if (!image) {
      return res.status(400).json({ success: false, error: '缺少图片数据' });
    }

    if (typeof image !== 'string') {
      return res.status(400).json({ success: false, error: '图片数据格式错误' });
    }

    if (image.startsWith('cloud://')) {
      return res.status(400).json({
        success: false,
        error: '请先上传图片到云存储，获取真实URL后再分析'
      });
    }

    if (!isUrl(image) && !image.startsWith('data:image') && !/^[a-zA-Z0-9+/=]+$/.test(image)) {
      return res.status(400).json({
        success: false,
        error: '图片数据格式错误，请提供 Base64 编码的图片或有效的 URL'
      });
    }

    if (!isUrl(image) && image.includes('data:image')) {
      const parts = image.split(',');
      if (parts.length !== 2) {
        return res.status(400).json({ success: false, error: '图片数据格式错误' });
      }
      const mimeMatch = parts[0].match(/data:image\/(\w+)/);
      if (!mimeMatch) {
        return res.status(400).json({ success: false, error: '不支持的图片 MIME 类型' });
      }
    }

    const result = await analyzeWithVisionAI(image);

    res.status(200).json({
      success: true,
      data: {
        ...result,
        openid: openid || 'anonymous',
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({
      success: false,
      error: '分析失败，请重试',
    });
  }
};
