import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function getKey() {
  const configured = process.env.TOKEN_ENCRYPTION_KEY;
  if (!configured) throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  return createHash('sha256').update(configured).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decryptSecret(value: string) {
  const [ivEncoded, tagEncoded, encryptedEncoded] = value.split('.');
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error('Invalid encrypted secret');

  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivEncoded, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}