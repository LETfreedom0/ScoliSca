import { NextResponse } from 'next/server';
import { listFiles, getPublicUrl } from '@/lib/r2';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || 'uploads/';

    const files = await listFiles(prefix);

    const result = files.map((file) => ({
      key: file.Key,
      url: file.Key ? getPublicUrl(file.Key) : '',
      size: file.Size,
      lastModified: file.LastModified,
    }));

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { success: false, error: '获取文件列表失败' },
      { status: 500 }
    );
  }
}
