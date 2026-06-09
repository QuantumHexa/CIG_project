import sharp from "sharp";

/** 64-dim normalized color/grid embedding (no native ML deps; works on all platforms) */
export type FaceDescriptor = number[];

const GRID = 8;

export async function extractFaceDescriptors(
  imagePath: string
): Promise<FaceDescriptor[]> {
  const embedding = await imageEmbedding(imagePath);
  return embedding.length ? [embedding] : [];
}

export async function extractFaceDescriptorsFromBuffer(
  buffer: Buffer
): Promise<FaceDescriptor[]> {
  const embedding = await imageEmbeddingBuffer(buffer);
  return embedding.length ? [embedding] : [];
}

async function imageEmbedding(filePath: string): Promise<FaceDescriptor> {
  const buffer = await sharp(filePath).rotate().toBuffer();
  return imageEmbeddingBuffer(buffer);
}

async function imageEmbeddingBuffer(buffer: Buffer): Promise<FaceDescriptor> {
  const { data } = await sharp(buffer)
    .resize(GRID, GRID, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const vec: number[] = [];
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i]! / 255;
    const g = data[i + 1]! / 255;
    const b = data[i + 2]! / 255;
    vec.push(r, g, b);
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function euclideanDistance(a: FaceDescriptor, b: FaceDescriptor): number {
  const len = Math.min(a.length, b.length);
  if (!len) return Infinity;
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const diff = a[i]! - b[i]!;
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/** Lower distance = more similar (tuned for 8x8 color grid embeddings) */
export function matchFaces(
  reference: FaceDescriptor,
  mediaFaces: FaceDescriptor[],
  threshold = 0.35
): boolean {
  return mediaFaces.some((f) => euclideanDistance(reference, f) < threshold);
}
