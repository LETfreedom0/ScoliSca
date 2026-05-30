# ScoliSca API

基于 Next.js 14 构建的脊柱侧弯筛查后端 API，使用 Cloudflare R2 进行图片存储。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **存储**: Cloudflare R2 Object Storage
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填写以下配置：

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

### 3. 本地开发

```bash
npm run dev
```

### 4. 构建部署

```bash
npm run build
vercel deploy
```

## API 接口

### 文件上传

**POST** `/api/files/upload`

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -F "file=@/path/to/image.jpg"
```

**响应**:

```json
{
  "success": true,
  "data": {
    "key": "uploads/1699999999999-random.jpg",
    "url": "https://your-domain.r2.cloudflarestorage.com/bucket/uploads/1699999999999-random.jpg",
    "filename": "image.jpg",
    "size": 102400,
    "contentType": "image/jpeg",
    "timestamp": 1699999999999
  }
}
```

### 获取文件

**GET** `/api/files/get?key=uploads/xxx.jpg`

### 删除文件

**DELETE** `/api/files/delete?key=uploads/xxx.jpg`

### 列出文件

**GET** `/api/files/list?prefix=uploads/`

**响应**:

```json
{
  "success": true,
  "data": [
    {
      "key": "uploads/1699999999999-file1.jpg",
      "url": "https://your-domain.r2.cloudflarestorage.com/bucket/uploads/1699999999999-file1.jpg",
      "size": 102400,
      "lastModified": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 获取文件 URL

**GET** `/api/files/url?key=uploads/xxx.jpg`

### AI 分析

**POST** `/api/analyze`

**请求**:

```json
{
  "image": "图片URL或Base64编码",
  "prompt": "可选，自定义提示词",
  "provider": "可选，openai或doubao，默认openai",
  "openid": "可选，用户标识"
}
```

**响应**:

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
    "openid": "anonymous",
    "timestamp": 1699999999999
  }
}
```

**获取默认提示词**:

```bash
curl http://localhost:3000/api/analyze
```

**自定义提示词示例**:

```json
{
  "image": "https://example.com/back.jpg",
  "prompt": "请分析这张后背照片，评估是否有脊柱侧弯。重点关注：1) 双肩是否等高 2) 骨盆是否水平 3) 脊柱是否呈直线。返回JSON格式结果。"
}
```

## R2 配置步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 Object Storage
3. 创建 Bucket（设置为公开访问）
4. 在 R2 API Tokens 创建 Token，获取 Access Key ID 和 Secret Access Key
5. 配置环境变量

## 项目结构

```
src/
├── app/
│   └── api/
│       ├── files/
│       │   ├── upload/route.ts    # 上传文件
│       │   ├── get/route.ts       # 获取文件
│       │   ├── delete/route.ts    # 删除文件
│       │   ├── list/route.ts      # 列出文件
│       │   └── url/route.ts       # 获取文件URL
│       └── analyze/route.ts       # AI分析接口
└── lib/
    ├── r2.ts                      # R2 工具函数
    └── ai.ts                      # AI分析逻辑
```

## 环境变量完整配置

```bash
# R2 存储配置
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_DOMAIN=your-public-domain (optional)

# AI 配置
AI_PROVIDER=openai (默认)
OPENAI_API_KEY=your-openai-api-key
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_SECRET_KEY=your-doubao-secret-key
```
