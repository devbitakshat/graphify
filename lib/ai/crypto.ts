import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function secretKey() {
  const secret = process.env.AI_KEY_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AI_KEY_SECRET must be set to at least 32 characters to store API keys.");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64"), tag.toString("base64"), data.toString("base64")].join(":");
}

export function decryptSecret(sealed: string) {
  const [version, iv, tag, data] = sealed.split(":");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Unknown secret format.");
  const decipher = createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}
