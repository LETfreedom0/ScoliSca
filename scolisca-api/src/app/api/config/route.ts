import { NextResponse } from 'next/server';
import { updateConfig, getConfig } from '@/lib/config';
import { AI_PROVIDERS } from '@/lib/ai-models';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updatedConfig = updateConfig(body);

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: '配置已更新',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新配置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'updateR2') {
      const config = updateConfig({ r2: data });
      return NextResponse.json({
        success: true,
        data: config.r2,
        message: 'R2 配置已更新',
      });
    }

    if (action === 'updateAI') {
      const currentConfig = getConfig();
      const config = updateConfig({
        ai: {
          ...currentConfig.ai,
          ...data
        }
      });
      return NextResponse.json({
        success: true,
        data: config.ai,
        message: 'AI 配置已更新',
      });
    }

    if (action === 'updatePhotoPrompt') {
      const currentConfig = getConfig();
      const config = updateConfig({
        ai: {
          ...currentConfig.ai,
          prompts: {
            ...currentConfig.ai.prompts,
            photo: data.prompt
          }
        }
      });
      return NextResponse.json({
        success: true,
        data: { photoPrompt: config.ai.prompts.photo },
        message: '照片分析提示词已更新',
      });
    }

    if (action === 'updateXrayPrompt') {
      const currentConfig = getConfig();
      const config = updateConfig({
        ai: {
          ...currentConfig.ai,
          prompts: {
            ...currentConfig.ai.prompts,
            xray: data.prompt
          }
        }
      });
      return NextResponse.json({
        success: true,
        data: { xrayPrompt: config.ai.prompts.xray },
        message: 'X光片分析提示词已更新',
      });
    }

    return NextResponse.json(
      { success: false, error: '未知操作' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const config = getConfig();
    return NextResponse.json({
      success: true,
      data: {
        config,
        aiProviders: AI_PROVIDERS
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    );
  }
}