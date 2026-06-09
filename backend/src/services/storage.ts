import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env, useS3 } from "../lib/env.js";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const s3 = useS3
  ? new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    })
  : null;

export async function ensureUploadDir() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

export async function uploadBuffer(
  buffer: Buffer,
  mimeType: string,
  folder = "media"
): Promise<{ storageKey: string; url: string }> {
  const ext = mimeType.split("/")[1]?.split("+")[0] ?? "bin";
  const storageKey = `${folder}/${randomUUID()}.${ext}`;

  if (s3 && env.aws.bucket) {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: env.aws.bucket, Key: storageKey }),
      { expiresIn: 60 * 60 * 24 * 7 }
    );
    return { storageKey, url };
  }

  const localPath = path.join(uploadsDir, storageKey);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, buffer);
  return { storageKey, url: `/uploads/${storageKey}` };
}

export function publicUrl(storageKey: string): string {
  if (useS3 && s3 && env.aws.bucket) {
    return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${storageKey}`;
  }
  return `/uploads/${storageKey}`;
}
