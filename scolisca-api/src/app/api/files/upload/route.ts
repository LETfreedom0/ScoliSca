import { NextResponse } from 'next/server';
import { uploadFile, generateKey } from '@/lib/r2';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

async function uploadFileLocal(buffer: Buffer, key: string): Promise<{ key: string; url: string }> {
  ensureUploadDir();
  const localPath = path.join(LOCAL_UPLOAD_DIR, key.replace('uploads/', ''));
  await fs.promises.writeFile(localPath, buffer);
  return {
    key,
    url: `/uploads/${key.replace('uploads/', '')}`
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '缺少文件' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateKey(file.name);
    const contentType = file.type || 'application/octet-stream';

    let result;
    try {
      result = await uploadFile(buffer, key, contentType);
    } catch (r2Error) {
      console.warn('R2 upload failed, falling back to local storage:', r2Error);
      result = await uploadFileLocal(buffer, key);
    }

    return NextResponse.json({
      success: true,
      data: {
        key: result.key,
        url: result.url,
        filename: file.name,
        size: file.size,
        contentType,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败' },
      { status: 500 }
    );
  }
}
