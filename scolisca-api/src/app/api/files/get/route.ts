import { NextResponse } from 'next/server';
import { getFile, getPublicUrl } from '@/lib/r2';

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

    const response = await getFile(key);
    
    if (!response.Body) {
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      );
    }

    const byteArray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);
    const contentType = response.ContentType || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
      },
    });
  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { success: false, error: '获取文件失败' },
      { status: 500 }
    );
  }
}
