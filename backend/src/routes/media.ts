import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { MediaType, NotificationType, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  requireAuth,
  AuthedRequest,
  canAccessPrivateMedia,
} from "../middleware/auth.js";
import { uploadBuffer, ensureUploadDir } from "../services/storage.js";
import { generateTags } from "../services/aiTagging.js";
import { applyWatermark } from "../services/watermark.js";
import {
  extractFaceDescriptorsFromBuffer,
  matchFaces,
  FaceDescriptor,
} from "../services/faceRecognition.js";
import { createNotification } from "../services/notifications.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const mediaRouter = Router();

const mediaInclude = {
  uploadedBy: { select: { id: true, name: true, role: true } },
  tags: true,
  event: { select: { id: true, name: true, clubName: true, isPublic: true } },
  _count: { select: { likes: true, comments: true, favorites: true } },
};

mediaRouter.get("/search", async (req, res) => {
  const { q, eventId, tag, uploader, from, to } = req.query;
  const where: Record<string, unknown> = {};

  if (eventId) where.eventId = eventId;
  if (uploader) {
    where.uploadedBy = { name: { contains: String(uploader) } };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, Date>).gte = new Date(String(from));
    if (to) (where.createdAt as Record<string, Date>).lte = new Date(String(to));
  }
  if (tag) {
    where.tags = { some: { label: { contains: String(tag) } } };
  }
  if (q) {
    where.OR = [
      { title: { contains: String(q) } },
      { event: { name: { contains: String(q) } } },
      { tags: { some: { label: { contains: String(q) } } } },
      { uploadedBy: { name: { contains: String(q) } } },
    ];
  }

  const media = await prisma.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: mediaInclude,
  });
  res.json(media);
});

mediaRouter.post(
  "/upload",
  requireAuth,
  upload.array("files", 20),
  async (req: AuthedRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files?.length) return res.status(400).json({ error: "No files uploaded" });

      const { eventId, albumId, isPublic } = req.body as {
        eventId: string;
        albumId?: string;
        isPublic?: string;
      };

      if (!eventId) return res.status(400).json({ error: "eventId required" });

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ error: "Event not found" });

      await ensureUploadDir();
      const publicFlag = isPublic !== "false";
      const results = [];

      for (const file of files) {
        const isVideo =
          file.mimetype.startsWith("video/") ||
          /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
        let buffer = file.buffer;
        let thumbBuffer: Buffer | undefined;
        let width: number | undefined;
        let height: number | undefined;
        let faceData: FaceDescriptor[] = [];

        if (!isVideo) {
          try {
            buffer = await sharp(file.buffer)
              .rotate()
              .resize({
                width: 2400,
                height: 2400,
                fit: "inside",
                withoutEnlargement: true,
              })
              .jpeg({ quality: 85 })
              .toBuffer();

            const meta = await sharp(buffer).metadata();
            width = meta.width;
            height = meta.height;

            thumbBuffer = await sharp(buffer)
              .resize(400, 400, { fit: "cover" })
              .jpeg({ quality: 75 })
              .toBuffer();
          } catch (imgErr) {
            console.warn("[upload] Sharp failed, using original:", imgErr);
            buffer = file.buffer;
            try {
              thumbBuffer = await sharp(buffer)
                .resize(400, 400, { fit: "inside" })
                .jpeg({ quality: 75 })
                .toBuffer();
            } catch {
              thumbBuffer = undefined;
            }
          }

          faceData = await extractFaceDescriptorsFromBuffer(buffer);
        }

        const main = await uploadBuffer(
          buffer,
          isVideo ? file.mimetype || "video/mp4" : "image/jpeg"
        );
        let thumbnailUrl: string | undefined;
        if (thumbBuffer) {
          const thumb = await uploadBuffer(thumbBuffer, "image/jpeg", "thumbs");
          thumbnailUrl = thumb.url;
        }

        const aiTags = !isVideo
          ? await generateTags(buffer, event.category)
          : [{ label: "video", source: "AI" as const }];

        const media = await prisma.media.create({
          data: {
            eventId,
            albumId: albumId || undefined,
            uploadedById: req.user!.id,
            url: main.url,
            thumbnailUrl,
            storageKey: main.storageKey,
            type: isVideo ? MediaType.VIDEO : MediaType.PHOTO,
            mimeType: isVideo ? file.mimetype || "video/mp4" : "image/jpeg",
            sizeBytes: buffer.length,
            width,
            height,
            isPublic: publicFlag,
            faceData: faceData.length ? faceData : undefined,
            tags: { create: aiTags },
          },
          include: mediaInclude,
        });
        results.push(media);
      }

      res.status(201).json(results);
    } catch (err) {
      console.error("[upload]", err);
      res.status(500).json({
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }
);

mediaRouter.get("/event/:eventId", async (req: AuthedRequest, res) => {
  const userId = req.headers.authorization ? undefined : undefined;
  let authUserId: string | undefined;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const jwt = await import("jsonwebtoken");
      const { env } = await import("../lib/env.js");
      const payload = jwt.default.verify(header.slice(7), env.jwtSecret) as { id: string };
      authUserId = payload.id;
    } catch {
      /* guest */
    }
  }

  const event = await prisma.event.findUnique({ where: { id: req.params.eventId } });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const canPrivate = await canAccessPrivateMedia(authUserId, event.id);
  const media = await prisma.media.findMany({
    where: {
      eventId: req.params.eventId,
      OR: [{ isPublic: true }, ...(canPrivate ? [{ isPublic: false }] : [])],
    },
    orderBy: { createdAt: "desc" },
    include: mediaInclude,
  });
  res.json(media);
});

mediaRouter.post(
  "/face/selfie",
  requireAuth,
  upload.single("selfie"),
  async (req: AuthedRequest, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Selfie required" });

    const buffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
    const descriptors = await extractFaceDescriptorsFromBuffer(buffer);
    if (!descriptors.length) {
      return res.status(400).json({ error: "No face detected in selfie" });
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { faceDescriptor: descriptors[0] },
    });

    res.json({ success: true, message: "Face profile saved" });
  }
);

mediaRouter.get("/face/my-photos", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  const ref = user?.faceDescriptor as FaceDescriptor | null;
  if (!ref) {
    return res.status(400).json({ error: "Upload a reference selfie first" });
  }

  const all = await prisma.media.findMany({
    where: { type: MediaType.PHOTO, faceData: { not: null } },
    include: mediaInclude,
  });

  const matched = all.filter((m) => {
    const faces = (m.faceData as FaceDescriptor[] | null) ?? [];
    return matchFaces(ref, faces);
  });

  res.json(matched);
});

mediaRouter.get("/:id", async (req, res) => {
  const item = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: {
      ...mediaInclude,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
      userTags: {
        include: { taggedUser: { select: { id: true, name: true } } },
      },
    },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

mediaRouter.get("/:id/download", requireAuth, async (req: AuthedRequest, res) => {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: { event: true, uploadedBy: true },
  });
  if (!media) return res.status(404).json({ error: "Not found" });

  if (!media.isPublic) {
    const ok = await canAccessPrivateMedia(req.user!.id, media.eventId);
    if (!ok) return res.status(403).json({ error: "Private media" });
  }

  const filePath = path.join(process.cwd(), "uploads", media.storageKey);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return res.status(404).json({ error: "File not on disk; use S3 URL directly" });
  }

  if (media.type === MediaType.PHOTO) {
    buffer = await applyWatermark(buffer, [
      media.event.clubName,
      media.event.name,
      req.user!.role,
    ]);
  }

  res.setHeader("Content-Type", media.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${media.id}.${media.mimeType.split("/")[1]}"`
  );
  res.send(buffer);
});

mediaRouter.post("/:id/like", requireAuth, async (req: AuthedRequest, res) => {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: { uploadedBy: true },
  });
  if (!media) return res.status(404).json({ error: "Not found" });

  const like = await prisma.like.upsert({
    where: { userId_mediaId: { userId: req.user!.id, mediaId: media.id } },
    create: { userId: req.user!.id, mediaId: media.id },
    update: {},
  });

  if (media.uploadedById !== req.user!.id) {
    await createNotification({
      userId: media.uploadedById,
      actorId: req.user!.id,
      type: NotificationType.LIKE,
      message: `${req.user!.name} liked your photo`,
      mediaId: media.id,
    });
  }

  res.json(like);
});

mediaRouter.delete("/:id/like", requireAuth, async (req: AuthedRequest, res) => {
  await prisma.like.deleteMany({
    where: { userId: req.user!.id, mediaId: req.params.id },
  });
  res.status(204).send();
});

mediaRouter.post("/:id/comment", requireAuth, async (req: AuthedRequest, res) => {
  const { body: text } = req.body as { body: string };
  if (!text?.trim()) return res.status(400).json({ error: "Comment required" });

  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) return res.status(404).json({ error: "Not found" });

  const comment = await prisma.comment.create({
    data: { userId: req.user!.id, mediaId: media.id, body: text.trim() },
    include: { user: { select: { id: true, name: true } } },
  });

  if (media.uploadedById !== req.user!.id) {
    await createNotification({
      userId: media.uploadedById,
      actorId: req.user!.id,
      type: NotificationType.COMMENT,
      message: `${req.user!.name} commented on your upload`,
      mediaId: media.id,
    });
  }

  res.status(201).json(comment);
});

mediaRouter.post("/:id/favorite", requireAuth, async (req: AuthedRequest, res) => {
  const fav = await prisma.favorite.upsert({
    where: {
      userId_mediaId: { userId: req.user!.id, mediaId: req.params.id },
    },
    create: { userId: req.user!.id, mediaId: req.params.id },
    update: {},
  });
  res.json(fav);
});

mediaRouter.post("/:id/tag-user", requireAuth, async (req: AuthedRequest, res) => {
  const { userId } = req.body as { userId: string };
  if (!userId) return res.status(400).json({ error: "userId required" });

  const tag = await prisma.mediaUserTag.upsert({
    where: { mediaId_taggedUserId: { mediaId: req.params.id, taggedUserId: userId } },
    create: {
      mediaId: req.params.id,
      taggedUserId: userId,
      taggedById: req.user!.id,
    },
    update: {},
    include: { taggedUser: { select: { id: true, name: true } } },
  });

  await createNotification({
    userId,
    actorId: req.user!.id,
    type: NotificationType.TAG,
    message: `${req.user!.name} tagged you in a photo`,
    mediaId: req.params.id,
  });

  res.status(201).json(tag);
});
