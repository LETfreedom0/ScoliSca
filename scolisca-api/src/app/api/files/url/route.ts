import { NextResponse } from 'next/server';
import { getPublicUrl } from '@/lib/r2';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: '缺少文件 key' },
        { status: 400 }
      );
    }

    const url = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      data: { key, url },
    });
  } catch (error) {
    console.error('Get URL error:', error);
    return NextResponse.json(
      { success: false, error: '获取URL失败' },
      { status: 500 }
    );
  }
}
