import { NextResponse } from 'next/server';
import { analyzeImage, ImageType } from '@/lib/ai';
import { getPrompts } from '@/lib/config';

export const dynamic = 'force-dynamic';

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

function logWithTrace(traceId: string, message: string, data?: any): void {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [/api/analyze] [${traceId}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, provider, openid, imageType = 'photo' } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: '缺少图片数据' },
        { status: 400 }
      );
    }

    const result = await analyzeImage(image, {
      provider: provider as 'openai' | 'doubao' | 'zhipu' | undefined,
      imageType: imageType as ImageType,
      url: '/api/analyze',
    });

    const traceId = result.traceId || 'unknown';

    const response = NextResponse.json({
      ...result,
      data: result.data ? {
        ...result.data,
        openid: openid || 'anonymous',
        timestamp: Date.now(),
        imageType: imageType || 'photo'
      } : undefined,
    });

    logWithTrace(traceId, JSON.stringify({
      ...result,
      data: result.data ? {
        ...result.data,
        openid: openid || 'anonymous',
        timestamp: Date.now(),
        imageType: imageType || 'photo'
      } : undefined,
    }, null, 2));

    return response;
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: '分析失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const prompts = getPrompts();
    
    return NextResponse.json({
      success: true,
      data: {
        prompts,
        providers: ['openai', 'doubao', 'zhipu'],
        imageTypes: ['photo', 'xray'],
        instructions: {
          image: '可以是图片URL或Base64',
          imageType: '可选，指定图片类型：photo（普通照片）或 xray（X光片）',
          provider: '可选，指定AI提供商',
          openid: '可选，用户标识'
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    );
  }
}
