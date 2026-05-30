import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';

const R2_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucket: process.env.R2_BUCKET_NAME!,
  publicDomain: process.env.R2_PUBLIC_DOMAIN,
};

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

export const getPublicUrl = (key: string): string => {
  if (R2_CONFIG.publicDomain) {
    if (R2_CONFIG.publicDomain.includes('.r2.dev')) {
      return `https://${R2_CONFIG.publicDomain}/${key}`;
    }
    return `https://${R2_CONFIG.publicDomain}/${R2_CONFIG.bucket}/${key}`;
  }
  return `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com/${R2_CONFIG.bucket}/${key}`;
};

export const uploadFile = async (buffer: Buffer, key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return { key, url: getPublicUrl(key) };
};

export const getFile = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
  });

  const response = await r2Client.send(command);
  return response;
};

export const deleteFile = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
  });

  await r2Client.send(command);
};

export const listFiles = async (prefix?: string) => {
  const command = new ListObjectsCommand({
    Bucket: R2_CONFIG.bucket,
    Prefix: prefix,
  });

  const response = await r2Client.send(command);
  return response.Contents || [];
};

export const generateKey = (filename: string): string => {
  const timestamp = Date.now();
  const extension = filename.split('.').pop() || 'jpg';
  const random = Math.random().toString(36).substring(2, 9);
  return `uploads/${timestamp}-${random}.${extension}`;
};
