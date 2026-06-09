import sharp from "sharp";
import { TagSource } from "@prisma/client";
import { env } from "../lib/env.js";

const CATEGORY_TAGS: Record<string, string[]> = {
  sports: ["sports", "crowd", "competition", "team"],
  cultural: ["cultural", "fest", "performance", "crowd"],
  trip: ["travel", "mountains", "outdoors", "group"],
  party: ["party", "celebration", "night", "crowd"],
  workshop: ["workshop", "learning", "indoor"],
  photoshoot: ["portrait", "studio", "people"],
  default: ["event", "campus", "people"],
};

export async function generateTags(
  buffer: Buffer,
  category: string
): Promise<{ label: string; source: TagSource }[]> {
  const tags = new Set<string>();
  const base = CATEGORY_TAGS[category.toLowerCase()] ?? CATEGORY_TAGS.default;
  base.forEach((t) => tags.add(t));

  try {
    const { dominant } = await sharp(buffer).stats();
    const r = dominant.r ?? 0;
    const g = dominant.g ?? 0;
    const b = dominant.b ?? 0;
    if (b > r && b > g) tags.add("outdoor");
    if (g > r && g > b) tags.add("nature");
    if (r > 180 && g > 180 && b > 180) tags.add("bright");
    if (r < 80 && g < 80 && b < 80) tags.add("night");
  } catch {
    /* ignore */
  }

  if (env.hfToken) {
    const hfTags = await fetchHuggingFaceTags(buffer);
    hfTags.forEach((t) => tags.add(t));
  }

  return [...tags].slice(0, 12).map((label) => ({ label, source: TagSource.AI }));
}

async function fetchHuggingFaceTags(buffer: Buffer): Promise<string[]> {
  try {
    const base64 = buffer.toString("base64");
    const res = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: { image: base64 } }),
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { generated_text?: string }[] | { generated_text?: string };
    const text = Array.isArray(data)
      ? data[0]?.generated_text ?? ""
      : (data as { generated_text?: string }).generated_text ?? "";
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 6);
  } catch {
    return [];
  }
}
