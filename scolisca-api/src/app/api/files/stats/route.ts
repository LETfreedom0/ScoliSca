import { NextResponse } from 'next/server';
import { listFiles } from '@/lib/r2';

export async function GET() {
  try {
    const files = await listFiles('uploads/');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
    
    const imageFiles = files.filter((file) => {
      if (!file.Key) return false;
      const ext = file.Key.toLowerCase().split('.').pop();
      return imageExtensions.includes(`.${ext}`);
    });

    const totalSize = imageFiles.reduce((acc, file) => acc + (file.Size || 0), 0);
    const totalCount = imageFiles.length;

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    return NextResponse.json({
      success: true,
      data: {
        count: totalCount,
        totalSize: totalSize,
        totalSizeFormatted: formatSize(totalSize),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}
