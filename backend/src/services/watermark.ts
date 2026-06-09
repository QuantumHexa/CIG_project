import sharp from "sharp";

export async function applyWatermark(
  input: Buffer,
  lines: string[]
): Promise<Buffer> {
  const image = sharp(input);
  const meta = await image.metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 800;
  const fontSize = Math.max(14, Math.floor(width / 40));
  const text = lines.filter(Boolean).join(" • ");
  const svg = `
    <svg width="${width}" height="${height}">
      <style>
        .wm { fill: rgba(255,255,255,0.85); font-size: ${fontSize}px; font-family: Arial, sans-serif; font-weight: bold; }
      </style>
      <text x="24" y="${height - 24}" class="wm">${escapeXml(text)}</text>
    </svg>`;

  return image
    .composite([{ input: Buffer.from(svg), gravity: "southwest" }])
    .jpeg({ quality: 88 })
    .toBuffer();
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
