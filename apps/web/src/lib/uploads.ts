import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { join } from "path";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const EXTENSIONS: Record<string, string> = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm"
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

type MediaUpload = { type: "image" | "video"; title: string; url: string };

export async function saveMediaUpload(file: File): Promise<MediaUpload> {
  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) throw new Error("Use a JPG, PNG, GIF, WebP, MP4, WebM, or MOV file.");
  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) throw new Error(`${isImage ? "Images" : "Videos"} must be smaller than ${isImage ? "10 MB" : "50 MB"}.`);

  const extension = EXTENSIONS[file.type] ?? (isImage ? ".jpg" : ".mp4");
  const filename = `${randomUUID()}${extension}`;
  const uploadDirectory = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
  return { type: isImage ? "image" : "video", title: file.name, url: `/api/media/${filename}` };
}
