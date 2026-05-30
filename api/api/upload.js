const { uploadToR2, isR2Configured } = require('./_lib/r2');

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const validateImageBuffer = (buffer) => {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: '文件数据为空' };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小不能超过10MB' };
  }

  const header = buffer.slice(0, 12).toString('hex');
  if (header.startsWith('ffd8ff')) return { valid: true, type: 'image/jpeg', ext: 'jpg' };
  if (header.startsWith('89504e47')) return { valid: true, type: 'image/png', ext: 'png' };
  if (header.startsWith('52494646')) return { valid: true, type: 'image/webp', ext: 'webp' };

  return { valid: false, error: '不支持的图片格式，请上传 JPEG、PNG 或 WebP 格式' };
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持 POST 请求' });
  }

  try {
    if (!isR2Configured()) {
      return res.status(503).json({
        success: false,
        error: 'R2 存储未配置，请联系管理员',
      });
    }

    const { image, filename } = req.body || {};

    if (!image) {
      return res.status(400).json({ success: false, error: '缺少图片数据' });
    }

    let buffer;
    let contentType = 'image/jpeg';
    let finalFilename = `image-${Date.now()}.jpg`;

    if (typeof image === 'string') {
      if (image.startsWith('data:image')) {
        const parts = image.split(',');
        if (parts.length !== 2) {
          return res.status(400).json({ success: false, error: '图片数据格式错误' });
        }
        const mimeMatch = parts[0].match(/data:image\/(\w+)/);
        if (mimeMatch) {
          contentType = `image/${mimeMatch[1]}`;
          finalFilename = `image-${Date.now()}.${mimeMatch[1]}`;
        }
        buffer = Buffer.from(parts[1], 'base64');
      } else if (/^[a-zA-Z0-9+/=]+$/.test(image)) {
        buffer = Buffer.from(image, 'base64');
      } else {
        return res.status(400).json({ success: false, error: '图片数据格式错误' });
      }
    } else if (Array.isArray(image)) {
      buffer = Buffer.from(image);
    } else {
      return res.status(400).json({ success: false, error: '图片数据格式错误' });
    }

    const validation = validateImageBuffer(buffer);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    contentType = validation.type;
    if (filename) {
      const ext = filename.split('.').pop();
      finalFilename = `image-${Date.now()}.${ext || validation.ext}`;
    } else {
      finalFilename = `image-${Date.now()}.${validation.ext}`;
    }

    const result = await uploadToR2(buffer, finalFilename, contentType);

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: '上传失败，请重试',
    });
  }
};
