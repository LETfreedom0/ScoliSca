import { NextResponse } from 'next/server';

export async function GET() {
  const aiProvider = process.env.AI_PROVIDER;
  const openaiKey = process.env.OPENAI_API_KEY ? '已配置' : '未配置';
  const zhipuKey = process.env.ZHIPU_API_KEY ? '已配置' : '未配置';
  const doubaoKey = process.env.DOUBAO_API_KEY ? '已配置' : '未配置';
  const doubaoSecret = process.env.DOUBAO_SECRET_KEY ? '已配置' : '未配置';

  return NextResponse.json({
    success: true,
    data: {
      aiProvider: aiProvider || '未配置（将使用默认值）',
      apiKeys: {
        openai: openaiKey,
        zhipu: zhipuKey,
        doubao: doubaoKey,
        doubaoSecret: doubaoSecret
      },
      effectiveProvider: aiProvider || 'openai'
    }
  });
}