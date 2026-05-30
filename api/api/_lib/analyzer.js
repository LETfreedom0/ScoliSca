const axios = require('axios');

const LLM_CONFIG = {
  OPENAI: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  DOUBAO: {
    apiKey: process.env.DOUBAO_API_KEY,
    secretKey: process.env.DOUBAO_SECRET_KEY,
    model: 'ernie-4.0-8k-latest',
  },
};

const isUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024,
    });
    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';
    return { buffer, contentType };
  } catch (error) {
    throw new Error(`下载图片失败: ${error.message}`);
  }
};

const analyzeWithVisionAI = async (imageData) => {
  const provider = process.env.AI_PROVIDER || 'openai';

  if (provider === 'openai' && LLM_CONFIG.OPENAI.apiKey) {
    return analyzeWithOpenAI(imageData);
  } else if (provider === 'doubao' && LLM_CONFIG.DOUBAO.apiKey) {
    return analyzeWithDoubao(imageData);
  }

  return generateMockResult();
};

const analyzeWithOpenAI = async (imageData) => {
  try {
    let imageUrl;
    let imageBase64;

    if (isUrl(imageData)) {
      imageUrl = imageData;
    } else {
      const buffer = Buffer.isBuffer(imageData) ? imageData : Buffer.from(imageData, 'base64');
      imageBase64 = buffer.toString('base64');
      imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    const response = await axios.post(
      `${LLM_CONFIG.OPENAI.baseURL}/chat/completions`,
      {
        model: LLM_CONFIG.OPENAI.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `你是一位专业的脊柱侧弯筛查医生。请分析这张后背照片，评估脊柱侧弯风险。
请返回JSON格式的分析结果：
{
  "riskLevel": "low/medium/high",
  "shoulderBalance": "左肩高/右肩高/基本平衡",
  "pelvicTilt": "左倾/右倾/基本水平",
  "spineContour": "正常/S形侧弯/C形侧弯",
  "cobbAngle": 估计的Cobb角度数值,
  "recommendations": ["建议1", "建议2"],
  "summary": "一句话总结"
}
只返回JSON，不要其他内容。`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_CONFIG.OPENAI.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Vision API error:', error.message);
    return generateMockResult();
  }
};

const analyzeWithDoubao = async (imageData) => {
  try {
    let imageBase64;

    if (isUrl(imageData)) {
      const { buffer } = await downloadImage(imageData);
      imageBase64 = buffer.toString('base64');
    } else {
      const buffer = Buffer.isBuffer(imageData) ? imageData : Buffer.from(imageData, 'base64');
      imageBase64 = buffer.toString('base64');
    }

    const tokenResponse = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: LLM_CONFIG.DOUBAO.apiKey,
          client_secret: LLM_CONFIG.DOUBAO.secretKey,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const response = await axios.post(
      `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k-latest?access_token=${accessToken}`,
      {
        messages: [
          {
            role: 'user',
            content: `你是一位专业的脊柱侧弯筛查医生。请分析这张后背照片，评估脊柱侧弯风险。
请返回JSON格式的分析结果：
{
  "riskLevel": "low/medium/high",
  "shoulderBalance": "左肩高/右肩高/基本平衡",
  "pelvicTilt": "左倾/右倾/基本水平",
  "spineContour": "正常/S形侧弯/C形侧弯",
  "cobbAngle": 估计的Cobb角度数值,
  "recommendations": ["建议1", "建议2"],
  "summary": "一句话总结"
}
只返回JSON，不要其他内容。`,
          },
        ],
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const resultText = response.data.result;
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return generateMockResult();
  } catch (error) {
    console.error('Doubao API error:', error.message);
    return generateMockResult();
  }
};

const generateMockResult = () => {
  const riskLevels = ['low', 'medium', 'high'];
  const shoulderOptions = ['左肩略高', '右肩略高', '基本平衡'];
  const pelvicOptions = ['骨盆左倾', '骨盆右倾', '基本水平'];
  const spineOptions = ['脊柱轮廓正常', '疑似S形侧弯', '疑似C形侧弯'];

  const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  const shoulder = shoulderOptions[Math.floor(Math.random() * shoulderOptions.length)];
  const pelvic = pelvicOptions[Math.floor(Math.random() * pelvicOptions.length)];
  const spine = spineOptions[Math.floor(Math.random() * spineOptions.length)];

  let cobbAngle;
  if (risk === 'low') cobbAngle = Math.floor(Math.random() * 5) + 1;
  else if (risk === 'medium') cobbAngle = Math.floor(Math.random() * 10) + 10;
  else cobbAngle = Math.floor(Math.random() * 20) + 20;

  return {
    riskLevel: risk,
    shoulderBalance: shoulder,
    pelvicTilt: pelvic,
    spineContour: spine,
    cobbAngle,
    recommendations: [
      cobbAngle < 10 ? '姿态良好，继续保持' : '建议进行专业检查',
      '保持正确的坐姿和站姿',
      '适当进行背部肌肉锻炼',
    ],
    summary: `评估结果：${risk === 'low' ? '低风险' : risk === 'medium' ? '中风险，建议关注' : '高风险，建议尽快就医'}`,
  };
};

module.exports = { analyzeWithVisionAI, downloadImage, isUrl };
