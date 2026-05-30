# ScoliSca API

## 部署到 Vercel

```bash
cd api
vercel
```

## 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

### R2 对象存储（图片上传）

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | 是 |
| `R2_ACCESS_KEY_ID` | R2 Access Key ID | 是 |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key | 是 |
| `R2_BUCKET_NAME` | R2 Bucket 名称 | 是 |
| `R2_PUBLIC_DOMAIN` | 公共域名（如 `images.example.com`） | 否 |

### AI 分析

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `AI_PROVIDER` | AI 提供商: `openai` 或 `doubao` | `openai` |
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `DOUBAO_API_KEY` | 豆包 API Key | - |
| `DOUBAO_SECRET_KEY` | 豆包 Secret Key | - |

### R2 配置步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 Object Storage → 创建 Bucket
3. 在 R2 API Tokens 创建 Token，复制 Access Key ID 和 Secret Access Key
4. 在 Bucket 设置中配置自定义域或使用默认域名

## API 接口

### POST /api/upload

上传图片到 R2 存储

**请求：**

```json
{
  "image": "base64编码的图片数据 或 data:image/xxx;base64,xxx",
  "filename": "optional-filename.jpg"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "url": "https://images.example.com/uploads/1699999999999-image.jpg",
    "key": "uploads/1699999999999-image.jpg",
    "timestamp": 1699999999999
  }
}
```

### POST /api/analyze

分析后背照片，评估脊柱侧弯风险

**请求：**

```json
{
  "image": "图片URL 或 base64编码",
  "openid": "用户openid"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "riskLevel": "low",
    "shoulderBalance": "基本平衡",
    "pelvicTilt": "基本水平",
    "spineContour": "脊柱轮廓正常",
    "cobbAngle": 3,
    "recommendations": ["姿态良好，继续保持", "保持正确的坐姿和站姿"],
    "summary": "评估结果：低风险",
    "openid": "xxx",
    "timestamp": 1699999999999
  }
}
```

## 小程序端调用示例

```javascript
// 1. 上传图片到 R2
wx.uploadFile({
  url: 'https://your-api.vercel.app/api/upload',
  filePath: tempFilePath,
  name: 'image',
  success: async (res) => {
    const { data } = JSON.parse(res.data);
    const imageUrl = data.url;

    // 2. 调用分析接口
    wx.request({
      url: 'https://your-api.vercel.app/api/analyze',
      method: 'POST',
      data: {
        image: imageUrl,
        openid: '用户openid'
      },
      success: (res) => {
        const result = res.data.data;
        wx.setStorageSync('analysisResult', result);
        wx.navigateTo({ url: '/pages/photo/result' });
      }
    });
  }
});
```
