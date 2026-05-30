import { NextResponse } from 'next/server';
import { deleteFile } from '@/lib/r2';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: '缺少文件 key' },
        { status: 400 }
      );
    }

    await deleteFile(key);

    return NextResponse.json({
      success: true,
      data: { key, message: '删除成功' },
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
