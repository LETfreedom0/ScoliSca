const axios = require('axios');
const crypto = require('crypto');

const R2_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET_NAME,
  publicDomain: process.env.R2_PUBLIC_DOMAIN,
};

const signR2Request = (method, path, headers, body) => {
  const date = new Date().toUTCString();
  const dateStamp = date.split(' ')[4].split(':')[0] + date.split(' ')[4].split(':')[1] + date.split(' ')[4].split(':')[2].split(' ')[0]);

  const canonicalHeaders = `host:${R2_CONFIG.accountId}.r2.cloudflarestorage.com\nx-amz-date:${date}\n`;
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = crypto.createHash('sha256').update(body || '').digest('hex');

  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    date,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const kDate = crypto.createHmac('sha256', `AWS4${R2_CONFIG.secretAccessKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update('auto').digest();
  const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();

  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authHeader = [
    `AWS4-HMAC-SHA256 Credential=${R2_CONFIG.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ');

  return {
    'x-amz-date': date,
    Authorization: authHeader,
    'x-amz-content-sha256': payloadHash,
  };
};

const uploadToR2 = async (buffer, filename, contentType) => {
  const objectKey = `uploads/${Date.now()}-${filename}`;
  const path = `/${R2_CONFIG.bucket}/${objectKey}`;

  const headers = {
    'Content-Type': contentType,
    'Content-Length': buffer.length,
    ...signR2Request('PUT', path, {}, buffer),
  };

  const response = await axios.put(
    `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com${path}`,
    buffer,
    { headers }
  );

  const publicUrl = R2_CONFIG.publicDomain
    ? `https://${R2_CONFIG.publicDomain}/${objectKey}`
    : `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com/${R2_CONFIG.bucket}/${objectKey}`;

  return { url: publicUrl, key: objectKey };
};

const downloadFromUrl = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return {
    buffer: Buffer.from(response.data),
    contentType: response.headers['content-type'] || 'image/jpeg',
  };
};

const isR2Configured = () => {
  return !!(
    R2_CONFIG.accountId &&
    R2_CONFIG.accessKeyId &&
    R2_CONFIG.secretAccessKey &&
    R2_CONFIG.bucket
  );
};

module.exports = {
  uploadToR2,
  downloadFromUrl,
  isR2Configured,
  R2_CONFIG,
};
